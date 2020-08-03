const request = require("request");
const chalk = require('chalk');
const fs = require("fs-extra");

const config = require("./config.json");

const SUCCESS = chalk.hex("#47FF56");
const ERROR = chalk.hex("#FF0000");
const WARN = chalk.hex("#FFAE42");
const PROCESS = chalk.hex("#FFA500");
const INFO = chalk.hex("#FF68F4");
const LOG = chalk.hex("#35B8FF");

const SURL = "https://discord.com/api/v6/users/@me/settings";

setInterval(compareStats, 60000);

/* Adds [LOG] and [time/date] prefix to all console.logs */

let originalConsoleLog = console.log;
console.log = function () {
    args = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');

    args.push(`${LOG(`[LOG]`)} ${INFO(`[${day}/${month}/${year} @ ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleLog.apply(console, args);
};

/* Adds [WARN] and [time/date] prefix to all console.warns */

let originalConsoleWarn = console.warn;
console.warn = function () {
    args = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');

    args.push(`${WARN(`[WARN]`)} ${INFO(`[${day}/${month}/${year} @ ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleWarn.apply(console, args);
};

/* Adds [ERROR] and [time/date] prefix to all console.errors */

let originalConsoleError = console.error;
console.error = function () {
    args = [];
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let hours = date.getUTCHours().toString().padStart(2, '0');
    let minutes = date.getUTCMinutes().toString().padStart(2, '0');
    let seconds = date.getUTCSeconds().toString().padStart(2, '0');

    args.push(`${ERROR(`[ERROR]`)} ${INFO(`[${day}/${month}/${year} @ ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleError.apply(console, args);
};

/* Start the Application and Check for Updates */

console.log(SUCCESS("Application started successfully."));
statusCheck();

/* PATCH request to Discord User, set Custom Status from provided text, emoji_id and emoji_name */

function statusCheck() {
    return new Promise((resolve, reject) => {
        request({
            method: "GET",
            uri: SURL,
            headers: {
                Authorization: config.token
            },
            json: true
        }, (err, res) => {
            if (err) {
                reject(ERROR("[ERROR] " + err));
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(ERROR("[ERROR] Invalid Status Code: " + res.statusCode)));
                return;
            }
            resolve(true);
            let status = res.body.custom_status;
            if(status.emoji_id !== config.emojiID || status.emoji_name !== config.emojiName) {
                doRequest(); /* Update Custom Status */
            } else {
                compareStats(); /* Fetch figures from API as normal */
            }
        });
    });
}

function doRequest() {
    let data = fs.readFileSync('./data.json', 'utf8');
    let stats = JSON.parse(data);
    return new Promise((resolve, reject) => {
        request({
            method: "PATCH",
            uri: SURL,
            headers: {
                Authorization: config.token
            },
            json: {
                custom_status: {
                    text: "Today: " + formatNumber(stats.todayCases) + " Cases & " + formatNumber(stats.todayDeaths) + " Deaths",
                    emoji_id: config.emojiID,
                    emoji_name: config.emojiName
                }
            }
        }, (err, res) => {
            if (err) {
                reject(ERROR("[ERROR] " + err));
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(ERROR("[ERROR] Invalid Status Code: " + res.statusCode)));
                return;
            }
            resolve(true);
            console.log(LOG("[STATUS UPDATE] " + INFO("Today: " + formatNumber(stats.todayCases) + " Cases & " + formatNumber(stats.todayDeaths) + " Deaths")));
        });
    });
}

/* GET request to URL, fetches 'todayCases' and 'todayDeaths' from API response */

function compareStats() {
    let data = fs.readFileSync('./data.json', 'utf8');
    let stats = JSON.parse(data);
    request({
        url: `https://disease.sh/v3/covid-19/countries/${config.country}`,
        json: true
    }, function (err, data) {
        if (err) {
            console.log(ERROR(err));
        } else {
            let newestDate = Math.max(stats.updated, data.body.updated); /* Compare two dates and store the most recent in 'newestDate' */
            if (newestDate <= stats.updated) { /* If newestDate is less or equal to the value in 'data.json' */
                return; /* If yes, return */
            } else {
                stats.updated = newestDate; /* Set the 'updated' value to newestDate */
                fs.writeFileSync('./data.json', JSON.stringify(stats, null, 2)); /* Write the value to file */
                try {
                    if (stats.cases != data.body.cases && data.body.cases != undefined || stats.todayCases != data.body.todayCases && data.body.todayCases != undefined ||
                        stats.deaths != data.body.deaths && data.body.deaths != undefined || stats.todayDeaths != data.body.todayDeaths && data.body.todayDeaths != undefined) {
                        let coronaData = {
                            updated: newestDate,
                            cases: data.body.cases,
                            todayCases: data.body.todayCases,
                            deaths: data.body.deaths,
                            todayDeaths: data.body.todayDeaths,
                            recovered: data.body.recovered
                        };
                        let newData = JSON.stringify(coronaData, null, 4);
                        fs.writeFileSync('./data.json', newData)
                        console.log(LOG("[NEW] " + INFO("Figures have updated to: " + formatNumber(data.body.todayCases) + " Cases & " + formatNumber(data.body.todayDeaths) + " Deaths")));
                        doRequest();
                    } else {
                        return;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}