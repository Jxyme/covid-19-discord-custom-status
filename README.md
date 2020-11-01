# covid-19-discord-custom-status
Automatically adjust your Discord Custom Status with the latest COVID-19 Figures. (Country Specific)

### Table of Contents
**[Warning](#warning)**<br>
**[Requirements](#requirements)**<br>
**[Usage Instructions](#usage-instructions)**<br>
**[Configuration](#configuration-breakdown)**<br>
**[Breakdown](#breakdown)**<br>
**[Example](#custom-status-example)**

## Warning
This technically falls under a "[self-bot](https://support.discord.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-)" since it uses your Discord token to make an API request on the User Settings endpoint.

The application will **only** edit your custom status when it detects changes, not every time new figures are fetched.

Please use this at your own risk. I do **not** take responsibility if your account gets banned. :rotating_light:

## Requirements
[NodeJS](https://nodejs.org/en/download/)

[Discord User Token](https://github.com/Tyrrrz/DiscordChatExporter/wiki/Obtaining-Token-and-Channel-IDs#how-to-get-a-user-token)

## Usage Instructions
1. Download and install [NodeJS](https://nodejs.org/en/download/).

2. Download the latest .ZIP from the [Releases](https://github.com/Jxyme/covid-19-discord-custom-status/releases) section from this repo. (feel free to clone/fork for further tweaking/development)

3. Run `npm i` from inside of the directory to install all of the node_module required packages for the project.

4. Open the `config.json.example` file, modify the contents, and then save it as `config.json`. (see below for a few examples)

5. Run `node .` or `node index.js` to start the application. (ensuring you followed Step 4 beforehand)

## Configuration Breakdown

### `config.json.example`

```json
{
    "token": "YOUR_DISCORD_USER_TOKEN_GOES_HERE",
    "showYesterday": "TRUE_OR_FALSE_WITHOUT_QUOTES",
    "country": "ENTER_YOUR_COUNTRY_CODE_HERE",
    "emojiID": "NITRO_EMOJI_ID",
    "emojiName": "EMOJI_NAME",
    "suffix": "ANYTHING TYPED HERE WILL BE DISPLAYED AFTER THE FIGURES (MAX 75 CHARS)"
}
```

## Breakdown

### Display Today's Figures
Your custom status will be updated with the latest figures for today, even if they're equal to `0` Cases & `0` Deaths. (e.g. a new day)

### Display Yesterday's Figures (as of 1.0.2)
Between 00:00 - 03:00 GMT+0 yesterday's figures will be fetched, upon detecting new figures, your custom status will be updated.

Once today's figures have been released, your custom status will update once more, displaying the latest figures for today.

***Please note, yesterday's figures reset after midnight GMT+0, thereabouts. Figures are provided by Worldometers. ([Source](https://www.worldometers.info/coronavirus/))***

### Custom Status Detection (as of 1.0.2)
When you start the application a number of checks will be made to ensure your custom status is always up to date.

Previously, if you were to modify the `emojiID`, `emojiName` or even disable the custom status you'd have to wait for new figures.

Now, disabling the custom status and/or modifying the config will detect a change and update your custom status accordingly.

***Please note, the custom status Detection only runs once at start up so you will need to restart the application manually.***

### Suffix (as of 1.0.2)
Add a unique suffix to your custom status. (e.g. **Today: 23,254 Cases & 162 Deaths** → **Today: 23,254 Cases & 162 Deaths — jayme.dev**)

### Support for ordinary Emoji's
Below you'll find two examples, one for ordinary Emoji's (Discord) and Custom Emoji's. (Nitro Classic and Nitro)

For example, if you want to use the :mask: emoji, you need to set the emoji's [character](https://emojipedia.org/emoji/%F0%9F%98%B7/) as the `emojiName` and set `emojiID` to `null`.

You can use [Emojipedia](https://emojipedia.org/) to search for the emoji of your choice and Copy & Paste it's character into the `emojiName` field.

```json
{
    "token": "YOUR_DISCORD_USER_TOKEN_GOES_HERE",
    "showYesterday": true,
    "country": "uk",
    "emojiID": null,
    "emojiName": "😷",
    "suffix": "— jayme.dev"
}
```

### Custom Emoji's (Nitro Classic and Nitro)
In order to receive the `emojiID` and `emojiName`, type `\` followed by the Nitro Emoji. For example, `\:covid19:` and press `ENTER`.

Once you've sent the Emoji in Discord you'll see a result like so `<:covid19:693518580016218122>` which will be used in the `.json`.

```json
{
    "token": "YOUR_DISCORD_USER_TOKEN_GOES_HERE",
    "showYesterday": true,
    "country": "united%20kingdom",
    "emojiID": "693518580016218122",
    "emojiName": "covid19",
    "suffix": "— jayme.dev"
}
```

## Custom Status Example

### `data.json`
```json
{
    "today": {
        "cases": 1034914,
        "todayCases": 23254,
        "deaths": 46717,
        "todayDeaths": 162,
        "recovered": 0,
        "updated": 1604257092486
    },
    "yesterday": {
        "cases": 1011660,
        "todayCases": 21915,
        "deaths": 46555,
        "todayDeaths": 326,
        "recovered": 0,
        "updated": 1604257093392
    },
    "country": "uk",
    "suffix": "— jayme.dev"
}
```

### Figures for 01/11/2020 (today) and 31/10/2020 (yesterday) in the United Kingdom. ([Source](https://www.worldometers.info/coronavirus/country/uk/))

![Figures](https://i.jayme.dev/WzblSRs.png)