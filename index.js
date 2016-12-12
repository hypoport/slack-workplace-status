/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/
 This is a sample Slack Button application that provides a custom
 Slash command.
 This bot demonstrates many of the core features of Botkit:
 *
 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately
 # RUN THE BOT:
 Create a Slack app. Make sure to configure at least one Slash command!
 -> https://api.slack.com/applications/new
 Run your bot from the command line:
 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js
 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.
 # EXTEND THE BOT:
 Botkit is has many features for building cool and useful bots!
 Read all about it here:
 -> http://howdy.ai/botkit
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
// var express = require('express');
// var app = express();

var botkit = require('botkit');

// if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
//     console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
//     process.exit(1);
// }

var config = {}


// Beep Boop specifies the port you should listen on default to 8080 for local dev
var PORT = process.env.PORT || 8080
// Single team Slack token
var TOKEN = process.env.SLACK_TOKEN
// Slack slash command verify token
var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN

console.log("token: "+ TOKEN)
console.log("verify token: "+VERIFY_TOKEN)
var controller = botkit.slackbot()
var bot = controller.spawn({ token: TOKEN }).startRTM()

// fetch and store team information
bot.api.team.info({}, function (err, res) {
  if (err) {
    return console.error(err)
  }

  controller.storage.teams.save({id: res.team.id}, (err) => {
    if (err) {
      console.error(err)
    }
  })
})

// var controller = Botkit.slackbot(config).configureSlackApp(
//     {
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         scopes: ['commands'],
//     }
// );

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    // controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
    //    if (err) {
    //        res.status(500).send('ERROR: ' + err);
    //    } else {
    //        res.send('Success!');
    //    }
    // });
});


//
// BEGIN EDITING HERE!
//

controller.on('slash_command', function (slashCommand, message) {

    if (message.token !== VERIFY_TOKEN) {
        return slashCommand.res.send(401, 'Unauthorized with token: ' + VERIFY_TOKEN)
    }

    switch (message.command) {
        case "/wps":            

            // if no text was supplied, treat it as a help command
            if (message.text === "" || message.text === "help") {
                slashCommand.replyPrivate(message,
                    "I echo back what you tell me. " +
                    "Try typing `/echo hello` to see.");
                return;
            }

            // If we made it here, just echo what the user typed back at them
            //TODO You do it!
            slashCommand.replyPublic(message, "1", function() {
                slashCommand.replyPublicDelayed(message, "2").then(slashCommand.replyPublicDelayed(message, "3"));
            });

            break;
        default:
            slashCommand.replyPublic(message, "I'm afraid I don't know how to " + message.command + " yet.");

    }

});



// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

// app.listen(process.env.PORT, function () {
//   console.log('Example app listening on port '+process.env.PORT);
// });
