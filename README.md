# PoGoGram
Pokémon Go integration with Telegram Bot. With this simples app, you can setup a Telegram bot that searches for Pokémons in a given area.

# Instalation
Simple as it could be.

To install PoGoGram Locally, just run `npm install pogogram`.

Use the following code to install it globally: `npm install -g pogogram`

## Enviromental Variables
You must set the following ENV_VARS to use the app.

| Variable | Description |
| -------- | ------- |
| PGO_USERNAME | A Pokemón Go account username (PTC or Google) |
| PGO_PASSWORD | The password for the account |
| PGO_PROVIDER | Account type. 'ptc' for PTC or 'google' for Google |
| PGO_TELEGRAM_TOKEN | The token for your Telegram bot |

## Telegram bot
You will need a Telegram bot. To create one, just follow these [easy steps](https://core.telegram.org/bots).

# Using the bot
I'll make it short.

`node pogogram.js` or even just `npm start`.

# Disclaimer
The app uses a unofficial Pokémon Go API to get the data. The account used might be blocked. Do not use you personal account!

# Acknowledgment
This is built upon the work of others. Let's give a round of applause to [yagop](https://github.com/yagop) for the excelent [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api), and [brentschooley](https://github.com/brentschooley) that created [pokespotter](https://github.com/brentschooley/pokespotter).
