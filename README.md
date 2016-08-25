# PoGoGram
With this simples app you can setup a Telegram bot that searches for Pokémons in a given area.

# Requirements
## Telegram bot
You will need a Telegram bot. To create one, just follow these [easy steps](https://core.telegram.org/bots).

# Instalation
Simple as it could be.

To install PoGoGram locally, just run `npm install pogogram`.

Or, install it globally: `npm install -g pogogram`

## Enviromental Variables
You must set the following ENV_VARS to use the app.

| Variable | Description |
| -------- | ------- |
| PGO_USERNAME | A Pokemón Go account username (PTC or Google) |
| PGO_PASSWORD | The password for the account |
| PGO_PROVIDER | Account type. 'ptc' for PTC or 'google' for Google |
| PGO_TELEGRAM_TOKEN | The token for your Telegram bot |

# Using the bot
I'll make it short.

`node pogogram.js` or even just `npm start`.

Then, in Telegram, just talk with your bot. You will need to set the commands in Telegram too. Just talk to BotFather.

I know commands are hardcoded, and that's why we are in alpha. Also, all texts are in portuguese if you're wondering what language is that. :-)

# Disclaimer
The app uses an unofficial Pokémon Go API. The account used might be blocked. Do not use you personal account!

# Acknowledgment
This is built upon the work of others. Let's give a round of applause to [yagop](https://github.com/yagop) for the excelent [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api), and [brentschooley](https://github.com/brentschooley) that created [pokespotter](https://github.com/brentschooley/pokespotter).
