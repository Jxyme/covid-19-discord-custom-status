# covid-19-discord-custom-status
Automatically adjust your Discord Custom Status with the latest COVID-19 Statistics. (Country Specific)

### Table of Contents
**[Warning](#warning)**<br>
**[Requirements](#requirements)**<br>
**[Usage Instructions](#usage-instructions)**<br>
**[Configuration](#examples)**<br>
**[Example](#custom-status-example)**

## Warning
This techincally falls under a "self-bot" since it does use your Discord token to make an API request on the User Settings endpoint.

The application will **only** edit your Custom Status when it detects changes, not every time new figures are fetched.

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
    "country": "ENTER_YOUR_COUNTRY_CODE_HERE",
    "emojiID": "NITRO_EMOJI_ID",
    "emojiName": "EMOJI_NAME"
}
```

## Examples
Below you'll find two examples, one for ordinary Emoji's (Discord) and Custom Emoji's. You do **NOT** need to include the `:`'s.

For example, if you want to use the :mask: emoji, you only need to provide `mask` as the `emojiName` and set `emojiID` to `null`.

### Support for ordinary Emoji's

```json
{
    "token": "YOUR_DISCORD_USER_TOKEN_GOES_HERE",
    "country": "uk",
    "emojiID": null,
    "emojiName": "mask"
}
```

### Custom Emoji's (Nitro Classic and Nitro)
In order to receive the `emojiID` and `emojiName`, type `\` followed by the Nitro Emoji. For example, `\:covid19:` and press `ENTER`.

Once you've sent the Emoji in Discord you'll see a result like so `<:covid19:693518580016218122>` which'll be used in the `.json`.

```json
{
    "token": "YOUR_DISCORD_USER_TOKEN_GOES_HERE",
    "country": "united%20kingdom",
    "emojiID": "693518580016218122",
    "emojiName": "covid19"
}
```

## Custom Status Example

### Statistics for Thursday, 16th of July in the United Kingdom. ([Source](https://coronavirus.data.gov.uk/))

![Thursday 16th July](https://i.jayme.dev/kVGajf8.png)
