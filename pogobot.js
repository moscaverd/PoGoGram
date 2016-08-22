var Telegram = require('node-telegram-bot-api');
var pokespotter = require('pokespotter');
var request = require('request');

var username = process.env.PGO_USERNAME || '';
var password = process.env.PGO_PASSWORD || '';
var provider = process.env.PGO_PROVIDER || 'google';
var telegramToken = process.env.PGO_TELEGRAM_TOKEN || '';
var location = '';

var stepsInEachDirection = 2;

// Log to Telegram API with token (env PGO_TELEGRAM_TOKEN)
var bot = new Telegram(telegramToken, {polling: true});

// Bot received any message
bot.on('message', (msg) => {

  console.log(msg);

  if (msg.location) {
    location = msg.location;
    bot.sendMessage(msg.chat.id, 'Agora eu sei onde você está. Use /temosquepegar para buscar Pokémons!');
  } else {
    switch (msg.text) {
      case '/temosquepegar':
        if (!location.latitude || !location.longitude) {
          bot.sendMessage(msg.chat.id, 'Não sei onde você está. Compartilhe a sua localização comigo');
        } else {
          bot.sendMessage(msg.chat.id, 'Espere um pouco. Estou correndo atrás de Pokémons para você!');

          // Logon to Pokémon GO API
          var Pokespotter = pokespotter(username, password, provider);
          Pokespotter.DEBUG = true;

          // Search for Pokémons
          Pokespotter.get(location, {
            steps: stepsInEachDirection,
            requestDelay: 0
          }).then((pokemon) => {

            if (pokemon.length > 0) {
              var pokemonsString = '';
              var idx = 1;
              pokemon.forEach((p) => {
                var remainingTime = new Date(p.expirationTime - Date.now());
                var remainingMin = remainingTime.getMinutes();
                var remainingSec = remainingTime.getSeconds();
                pokemonsString = pokemonsString + idx + ': ' + p.name + ' a ' + p.distance + 'm' + ' por ' + remainingMin + ':' + remainingSec + ' min' + '.\n';
                idx++;
              });

              // Get URL for the map image
              var mapUrl = pokespotter.getMapsUrl(location, pokemon, 1);

              // Get map image
              request({url:mapUrl, encoding:null}, (err, res, body) => {
                var imageBuffer = Buffer.from(body);

                console.log('Enviando foto...');

                // Send photo to user
                bot.sendPhoto(msg.chat.id, imageBuffer);
                // Send text with Pokémons locations to user
                bot.sendMessage(msg.chat.id, pokemonsString);
              });
            } else {
              bot.sendMessage(msg.chat.id, 'Nenhum pokémon encontrado');
            }

          }).catch((err) => {
            bot.sendMessage(msg.chat.id, 'Deu xabú!');
            console.error(err);
          });
        }
        break;
      case '/start':
        bot.sendMessage(msg.chat.id, 'Compartilhe a sua localização comigo para começar');
        break;
      default:
      // Command not recognized
      bot.sendMessage(msg.chat.id, 'Comando não reconhecido');
    }
  }
});
