var botkit = require("botkit");
var date = require("sugar-date");
var sugar = require("sugar");

if (!process.env.SLACK_TOKEN || !process.env.PORT || !process.env.SLACK_VERIFY_TOKEN) {
  console.log("Error: Specify SLACK_TOKEN, SLACK_VERIFY_TOKEN and PORT in environment");
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

controller.on("slash_command", function (slashCommand, message) {

  console.log("received", JSON.stringify(message));

  if (message.token !== VERIFY_TOKEN) {
    return slashCommand.res.send(401, "Unauthorized, please specify the correct verification token!")
  }

  switch (message.command) {
    case "/wps":

      // if no text was supplied, treat it as a help command
      if (message.text === "" || message.text === "help") {
        slashCommand.replyPrivate(message,
          "/wps helps you manage your workplace status of your teammates\n" +
          "/wps status date - sets your wps to state on date\n" +
          "you can enter dates in natural language. Here you can find some samples: https://sugarjs.com/docs/#/DateParsing");
        return;
      }

      var date = parseDate(message.text);

      var command = getStatus(message.text)
      switch (true) {
        case (/^sick$/).test(command):
          slashCommand.replyPublic(message, "I'm sorry to hear that you are sick on " + date);
          break;
        case (/^(vacation|vacay|vaca|vac)$/).test(command):
          slashCommand.replyPublic(message, "You deserved your vacation on " + date);
          break;
        case (/^(off|offline)$/).test(command):
          slashCommand.replyPublic(message, "offline on " + date);
          break;
        case (/^(homeoffice|ho|home)$/).test(command):
          slashCommand.replyPublic(message, "You're working from home on " + date);
          break;
        case (/^(remote|rem|rmt)$/).test(command):
          slashCommand.replyPublic(message, "You're working remote on " + date);
          break;
        case (/^(workoffice|office|work|wo)$/).test(command):
          slashCommand.replyPublic(message, "You're at work on " + date);
          break;
        default:
          slashCommand.replyPublic(message, "Sorry, I couldn't understand that. Try /wps only to get help.")
      }

      break;
    default:
      slashCommand.replyPublic(message, "Ooops. That command '" + message.command + "' is unexpected.");

  }

});

function getStatus(text) {
  var groups = text.match(/^(\w*) (.*)$/);
  return groups[1];
}

function parseDate(text) {
  var groups = text.match(/^(\w*) (.*)$/);
  var date = sugar.Date.create(groups[2]);
  // console.log(new sugar.Date().format("dd.mm"));
  return date;
}

