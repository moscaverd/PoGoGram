var Telegram = require('node-telegram-bot-api');
var pokespotter = require('pokespotter');
var request = require('request');

var username = process.env.PGO_USERNAME || '';
var password = process.env.PGO_PASSWORD || '';
var provider = process.env.PGO_PROVIDER || 'google';
var telegramToken = process.env.PGO_TELEGRAM_TOKEN || '';
var stepsInEachDirection = 2;
var users = [];

// Keep the date the service started
const onlineDate = new Date(Date.now());

// Log to Telegram API with token (env PGO_TELEGRAM_TOKEN)
var bot = new Telegram(telegramToken, {polling: true});

// Bot received any message
bot.on('message', (msg) => {

  var user;

  // Are you returning? (Existing user)
  users.forEach((u) => {
    if (u.id == msg.from.id) {
      u.nRequests++;
      user = u;
    }
  });

  // New user!
  if (!user) {
    user = {
      id: msg.from.id,
      firstName: msg.from.first_name,
      lastName: msg.from.last_name,
      location: msg.location,
      nRequests: 1
    }
    users.push(user);
  }

  // Location received
  if (msg.location) {
    users.forEach((u) => {
      if (u.id == user.id) {
        u.location = msg.location;
      }
    });
    bot.sendMessage(msg.from.id, 'Agora eu sei onde você está. \
      Use /temosquepegar para buscar Pokémons!');
  } else {
    // Any other message type
    switch (msg.text) {
      case '/temosquepegar':
        // Need the user's location to continue
        if (!user.location) {
          bot.sendMessage(msg.from.id, 'Não sei onde você está. Compartilhe a \
            sua localização comigo');
        } else {
          bot.sendMessage(msg.from.id,
            'Espere um pouco. Estou correndo atrás de Pokémons para você! \
            Estou usando a última localização que você enviou');

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
              // No Pokémon found :-(
              bot.sendMessage(msg.from.id, 'Nenhum pokémon encontrado');
            }

          }).catch((err) => {
            // The bot has stoped. Maybe he just needs some oil :-)
            bot.sendMessage(msg.from.id, 'Deu xabú!');
            console.error(err);
          });
        }
        break;
      case '/start':
        // Greetings message
        bot.sendMessage(msg.from.id, 'Compartilhe a sua localização comigo \
          para começar');
        break;
      case '/status':
        var status = 'Online desde: ' + onlineDate + '\n'
          + 'Usuários cadastrados: ' + users.length + '\n';
        users.forEach((u, i) => {
          status = status + (i + 1) + ': ' + u.id + ' - '
            + u.firstName + ' ' + u.lastName + ' (' + 'Reqs: ' + u.nRequests
            + ')' + '\n';
        });
        bot.sendMessage(msg.from.id, status);
        break;
      default:
      // Command not recognized
      bot.sendMessage(msg.from.id, 'Comando não reconhecido');
    }
  }
});
