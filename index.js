var botkit = require('botkit');

if (!process.env.SLACK_TOKEN || !process.env.PORT || !process.env.SLACK_VERIFY_TOKEN) {
  console.log('Error: Specify SLACK_TOKEN, SLACK_VERIFY_TOKEN and PORT in environment');
  process.exit(1);
}

console.log("started")
var PORT = process.env.PORT || 8080;
// Single team Slack token
var TOKEN = process.env.SLACK_TOKEN;
// Slack slash command verify token
var VERIFY_TOKEN = process.env.SLACK_VERIFY_TOKEN;

var controller = botkit.slackbot();
var bot = controller.spawn({token: TOKEN}).startRTM();

// fetch and store team information
bot.api.team.info({}, function (err, res) {
  if (err) {
    return console.error(err);
  }

  controller.storage.teams.save({id: res.team.id}, (err) => {
    if (err) {
      console.error(err);
    }
  });
});

controller.setupWebserver(process.env.PORT, function (err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
});

controller.on('slash_command', function (slashCommand, message) {

  console.log("received", JSON.stringify(message));
  
  if (message.token !== VERIFY_TOKEN) {
    return slashCommand.res.send(401, 'Unauthorized')
  }

  switch (message.command) {
    case "/wps":

      // if no text was supplied, treat it as a help command
      if (message.text === "" || message.text === "help") {
        slashCommand.replyPrivate(message,
          "status ...");
        return;
      }

      switch (message.text) {
        case "krank":
          slashCommand.replyPublic(message, "gute Besserung");
      }

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
