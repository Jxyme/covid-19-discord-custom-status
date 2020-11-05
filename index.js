const request = require('request');
const chalk = require('chalk');
const fs = require('fs-extra');

const config = require('./config.json');

const SUCCESS = chalk.hex('#43B581');
const ERROR = chalk.hex('#F04747');
const WARN = chalk.hex('#FAA61A');
const PROCESS = chalk.hex('#F57731');
const INFO = chalk.hex('#FF73FA');
const LOG = chalk.hex('#44DDBF');

const URL = `https://discord.com/api/v6/users/@me/settings`;

/* Adds [LOG] and [dd/mm/yyyy | hh:mm:ss UTC] prefix to all console.log's */

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
    args.push(`${LOG(`[LOG]`)} ${INFO(`[${day}/${month}/${year} | ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleLog.apply(console, args);
}

/* Adds [ERROR] and [dd/mm/yyyy | hh:mm:ss UTC] prefix to all console.error's */

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
    args.push(`${ERROR(`[ERROR]`)} ${INFO(`[${day}/${month}/${year} | ${hours}:${minutes}:${seconds} UTC]`)}`);
    for (var i = 0; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    originalConsoleError.apply(console, args);
}

/* Format today's and yesterday's date in the following format: dd/mm/yyyy (e.g. 31/10/2020) */

let today = new Date();
today.setDate(today.getDate());
let yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
let dd = today.getDate();
let ydd = yesterday.getDate();
let mm = today.getMonth() + 1;
let ymm = yesterday.getMonth() + 1;
let yy = today.getFullYear();
let yyy = yesterday.getFullYear();
if (dd < 10) {
    dd = `0${dd}`;
} else if (ydd < 10) {
    ydd = `0${ydd}`;
}
if (mm < 10) {
    mm = `0${mm}`;
} else if (ymm < 10) {
    ymm = `0${ymm}`;
}
today = `${dd}/${mm}/${yy}`;
yesterday = `${ydd}/${ymm}/${yyy}`;

console.log(SUCCESS(`Successfully started the application...`));
console.log(PROCESS(`Fetching latest figures for ${today} (today) and ${yesterday} (yesterday)`));

let dataType;
let figureOne;
let figureTwo;
let todayHasChanged;
let yesterdayHasChanged;

let initialTasks = [compareStatus, fetchToday, fetchYesterday, handleFigures],
    i = 0;

/* Consecutively execute initialTasks before handling the figures returned (onStartup only) */

onStartup();

function onStartup() {
    initialTasks[i++]();
    if (i < initialTasks.length) {
        setTimeout(onStartup, 5000); // 5 seconds
    }
}

/* Execute the tasks at a specified interval (in milliseconds) */

setInterval(function () {
    let hour = new Date().getUTCHours();
    let userPreference = config.showYesterday;
    if (userPreference && hour >= 0 && hour < 3) {
        y = 0;
        todayHasChanged = 0;
        yesterdayHasChanged = 0;
        checkYesterday();
    } else {
        t = 0;
        todayHasChanged = 0;
        yesterdayHasChanged = 0;
        checkToday();
    }
}, 60000); // 60 seconds

/* Consecutively execute yesterdayTasks before handling the figures returned */

let yesterdayTasks = [fetchToday, fetchYesterday, handleFigures],
    y = 0;

function checkYesterday() {
    yesterdayTasks[y++]();
    if (y < yesterdayTasks.length) {
        setTimeout(checkYesterday, 5000); // 5 seconds
    }
}

/* Consecutively execute todayTasks before handling the figures returned */

let todayTasks = [fetchToday, handleFigures],
    t = 0;

function checkToday() {
    todayTasks[t++]();
    if (t < todayTasks.length) {
        setTimeout(checkToday, 5000); // 5 seconds
    }
}

/* Compare the user's Custom Status with the localData before attempting to make any changes */

function compareStatus() {
    let localData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            uri: URL,
            headers: {
                Authorization: config.token
            },
            json: true,
        }, (err, res) => {
            if (err) {
                return reject(ERROR(`[ERROR] ${err}`));
            }
            if (res.statusCode !== 200) {
                return reject(ERROR(`[ERROR] Invalid Status Code: ${res.statusCode}`));
            }
            resolve(true);
            let customStatus = res.body.custom_status;
            if (customStatus === null) {
                console.log(WARN(`No already existing custom status was detected... setting user's status to the latest figures.`));
                return resetLocalData();
            }
            let defaultString = {
                'today': `Today: ${formatNumber(localData.today.todayCases)} Cases & ${formatNumber(localData.today.todayDeaths)} Deaths`,
                'yesterday': `Yesterday: ${formatNumber(localData.yesterday.todayCases)} Cases & ${formatNumber(localData.yesterday.todayDeaths)} Deaths`
            }
            let suitableSuffix = config.suffix;
            if (suitableSuffix && suitableSuffix.length > 75) {
                throw new Error(ERROR(`Suffix provided exceeds the maximum character length of 75.`));
            }
            if ([defaultString.today, `${defaultString.today} ${config.suffix}`, defaultString.yesterday, `${defaultString.yesterday} ${config.suffix}`].indexOf(customStatus.text) < 0 ||
                (customStatus.emoji_id !== config.emojiID) || (customStatus.emoji_name !== config.emojiName) || (localData.country !== config.country) || (localData.suffix !== config.suffix)) {
                console.log(WARN(`User's custom status is not up-to-date... setting user's status to the latest figures.`));
                return resetLocalData();
            } else if (config.showYesterday && (customStatus.text === 'Today: 0 Cases & 0 Deaths')) {
                console.log(WARN(`User's custom status is equal to today's figures, setting user's status to yesterday's figures.`));
                return resetLocalData();
            } else if (!config.showYesterday && ([defaultString.today, `${defaultString.today} ${config.suffix}`].indexOf(customStatus.text) < 0)) {
                console.log(WARN(`User's custom status is not equal to today's figures, setting user's status to today's figures.`));
                return resetLocalData();
            } else {
                console.log(WARN(`User's custom status is already up-to-date!`));
                return;
            }
        });
    });
}

/* Fetch the latest figures for today and write them to localData */

function fetchToday() {
    let localData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    request({
        url: `https://disease.sh/v3/covid-19/countries/${config.country}?yesterday=false&twoDaysAgo=false&strict=true&allowNull=false`,
        json: true
    }, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            let apiData = data.body;
            let newestDate = Math.max(localData.today.updated, apiData.updated);
            if (newestDate <= localData.today.updated) {
                return todayHasChanged = 0;
            } else {
                localData.today.updated = newestDate;
                fs.writeFileSync('./data.json', JSON.stringify(localData, null, 4));
                try {
                    if (localData.today.cases !== apiData.cases && apiData.cases !== undefined || localData.today.todayCases !== apiData.todayCases && apiData.todayCases !== undefined ||
                        localData.today.deaths !== apiData.deaths && apiData.deaths !== undefined || localData.today.todayDeaths !== apiData.todayDeaths && apiData.todayDeaths !== undefined ||
                        localData.today.recovered !== apiData.recovered && apiData.recovered !== undefined) {
                        for (let key in localData.today) {
                            localData.today[key] = apiData[key];
                        }
                        fs.writeFileSync('./data.json', JSON.stringify(localData, null, 4));
                        console.log(LOG('[TODAY] ' + WARN(`${formatNumber(apiData.todayCases)} Cases & ${formatNumber(apiData.todayDeaths)} Deaths`)));
                        return todayHasChanged = 1;
                    } else {
                        return todayHasChanged = 0;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });
}

/* Fetch the latest figures for yesterday and write them to localData */

function fetchYesterday() {
    let localData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    request({
        url: `https://disease.sh/v3/covid-19/countries/${config.country}?yesterday=true&twoDaysAgo=false&strict=true&allowNull=false`,
        json: true
    }, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            let apiData = data.body;
            let newestDate = Math.max(localData.yesterday.updated, apiData.updated);
            if (newestDate <= localData.yesterday.updated) {
                return yesterdayHasChanged = 0;
            } else {
                localData.yesterday.updated = newestDate;
                fs.writeFileSync('./data.json', JSON.stringify(localData, null, 4));
                try {
                    if (localData.yesterday.cases !== apiData.cases && apiData.cases !== undefined || localData.yesterday.todayCases !== apiData.todayCases && apiData.todayCases !== undefined ||
                        localData.yesterday.deaths !== apiData.deaths && apiData.deaths !== undefined || localData.yesterday.todayDeaths !== apiData.todayDeaths && apiData.todayDeaths !== undefined ||
                        localData.yesterday.recovered !== apiData.recovered && apiData.recovered !== undefined) {
                        for (let key in localData.yesterday) {
                            localData.yesterday[key] = apiData[key];
                        }
                        fs.writeFileSync('./data.json', JSON.stringify(localData, null, 4));
                        console.log(LOG('[YESTERDAY] ' + WARN(`${formatNumber(apiData.todayCases)} Cases & ${formatNumber(apiData.todayDeaths)} Deaths`)));
                        return yesterdayHasChanged = 1;
                    } else {
                        return yesterdayHasChanged = 0;
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });
}

/* Handle localData before attempting to update the user's Custom Status */

function handleFigures() {
    let localData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    let userPreference = config.showYesterday;
    if (userPreference) {
        if (yesterdayHasChanged && (localData.today.todayCases === 0 && localData.today.todayDeaths === 0) ||
            todayHasChanged && (localData.today.todayCases === 0 && localData.today.todayDeaths === 0)) {
            dataType = 'Yesterday';
            figureOne = formatNumber(localData.yesterday.todayCases);
            figureTwo = formatNumber(localData.yesterday.todayDeaths);
            return updateStatus();
        } else if (todayHasChanged && (localData.today.todayCases !== 0 || localData.today.todayDeaths !== 0)) {
            dataType = 'Today';
            figureOne = formatNumber(localData.today.todayCases);
            figureTwo = formatNumber(localData.today.todayDeaths);
            return updateStatus();
        } else {
            return;
        }
    } else {
        if (todayHasChanged) {
            dataType = 'Today';
            figureOne = formatNumber(localData.today.todayCases);
            figureTwo = formatNumber(localData.today.todayDeaths);
            return updateStatus();
        } else {
            return;
        }
    }
}

/* Update user's Custom Status */

function updateStatus() {
    return new Promise((resolve, reject) => {
        request({
            method: 'PATCH',
            uri: URL,
            headers: {
                Authorization: config.token
            },
            json: {
                custom_status: {
                    text: `${dataType}: ${figureOne} Cases & ${figureTwo} Deaths ${(config.suffix ? `${config.suffix}` : '')}`,
                    emoji_id: config.emojiID,
                    emoji_name: config.emojiName
                }
            }
        }, (err, res) => {
            if (err) {
                return reject(ERROR(`[ERROR] ${err}`));
            }
            if (res.statusCode !== 200) {
                return reject(ERROR(`[ERROR] Invalid Status Code: ${res.statusCode}`));
            }
            resolve(true);
            console.log(LOG('[UPDATED STATUS] ' + WARN(`${dataType}: ${figureOne} Cases & ${figureTwo} Deaths ${(config.suffix ? `${config.suffix}` : '')}`)))
        });
    });
}

/* Reset localData */

function resetLocalData() {
    let localData = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
    for (let key in localData.today) {
        localData.today[key] = 0;
    }
    for (let key in localData.yesterday) {
        localData.yesterday[key] = 0;
    }
    localData.country = config.country;
    localData.suffix = config.suffix;
    fs.writeFileSync('./data.json', JSON.stringify(localData, null, 4));
}

/* Format figureOne and figureTwo if they are > 999  (e.g. 23065 → 23,065) */

function formatNumber(figure) {
    return figure.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}   