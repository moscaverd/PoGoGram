var Telegram = require('node-telegram-bot-api');
var pokespotter = require('pokespotter');
var request = require('request');

var username = process.env.PGO_USERNAME || '';
var password = process.env.PGO_PASSWORD || '';
var provider = process.env.PGO_PROVIDER || 'google';
var telegramToken = process.env.PGO_TELEGRAM_TOKEN || '';
var stepsInEachDirection = 2;
var users = [];

// Log to Telegram API with token (env PGO_TELEGRAM_TOKEN)
var bot = new Telegram(telegramToken, {polling: true});

// Bot received any message
bot.on('message', (msg) => {

  var user;

  users.forEach((u) => {
    if (u.id = msg.from.id) {
      user = u;
    }
  });

  if (!user) {
    user = {
      id: msg.from.id,
      firstName: msg.from.first_name,
      lastName: msg.from.last_name,
      location: msg.location
    }
    users.push(user);
  }

  if (msg.location) {
    users.forEach((u) => {
      if (u.id = user.id) {
        u.location = msg.location;
      }
    });
    bot.sendMessage(msg.from.id,
      'Agora eu sei onde você está. Use /temosquepegar para buscar Pokémons!');
  } else {
    switch (msg.text) {
      case '/temosquepegar':
        if (!user.location) {
          bot.sendMessage(msg.from.id,
            'Não sei onde você está. Compartilhe a sua localização comigo');
        } else {
          bot.sendMessage(msg.from.id,
            'Espere um pouco. Estou correndo atrás de Pokémons para você!');

          // Logon to Pokémon GO API
          var Pokespotter = pokespotter(username, password, provider);
          // Pokespotter.DEBUG = true;

          // Search for Pokémons
          Pokespotter.get(user.location, {
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
                if (remainingSec < 10) {
                  remainingSec = '0'.concat(remainingSec);
                }
                pokemonsString = pokemonsString + idx + ': ' + p.name + ' a ' +
                  p.distance + 'm' + ' por ' + remainingMin + ':' + remainingSec
                  + ' min' + '.\n';
                idx++;
              });

              // Get URL for the map image
              var mapUrl = pokespotter.getMapsUrl(user.location, pokemon, 1);

              // Add the user location marker
              mapUrl = mapUrl + '&markers=color:blue|'
                + user.location.latitude + ',' + user.location.longitude;

              // Get map image
              request({url:mapUrl, encoding:null}, (err, res, body) => {
                var imageBuffer = Buffer.from(body);

                // Send photo to user
                bot.sendPhoto(msg.from.id, imageBuffer);
                // Send text with Pokémons locations to user
                bot.sendMessage(msg.from.id, pokemonsString);
              });
            } else {
              bot.sendMessage(msg.from.id, 'Nenhum pokémon encontrado');
            }

          }).catch((err) => {
            bot.sendMessage(msg.from.id, 'Deu xabú!');
            console.error(err);
          });
        }
        break;
      case '/start':
        bot.sendMessage(msg.from.id,
          'Compartilhe a sua localização comigo para começar');
        break;
      case '/status':
        var status = 'Usuários cadastrados: ' + users.length + '\n';
        users.forEach((u, i) => {
          status = status + (i + 1) + ': ' + u.id + ' - '
            + u.firstName + ' ' + u.lastName + '\n';
        });
        bot.sendMessage(msg.from.id, status);
        break;
      default:
      // Command not recognized
      bot.sendMessage(msg.from.id, 'Comando não reconhecido');
    }
  }
});
