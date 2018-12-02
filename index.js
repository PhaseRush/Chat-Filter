const slackEventsApi = require('@slack/events-api');
const SlackClient = require('@slack/client').WebClient;
const express = require('express');
const fs = require('fs'); //file system library
const papa = require('papaparse');
const file = fs.createReadStream('./fruits.csv');
//const file = fs.createReadStream('./harassment-lexicon.csv');

const fruitnames = [];
papa.parse(file, {
  worker: true,
  step: function(result){ //callback step executed when parsing completes
    var temp = result.data;
    var temp1 = temp[0];
    length = temp1.length;
    for(var i = 0; i < length ; i++){
      var name = temp1[i];
      fruitnames.push(name.toLowerCase());
    }
    
  },
  complete: function(results, file){
    //do nothing
  }
});
  
      
//General class imports
var appMentionHelper = require('./appMentionHelper');
var passiveListener = require('./passiveListener');

//method imports
var sendHi = require('./appMentionHelper').sendHi;
var negativity = require('./passiveListener').negativity;

// regex for matching subreddits
// var subredditRegex = /(.*\s)*/?(r\/).*/i;

// *** Initialize an Express application
const app = express();

// *** Initialize a client with your access token
const slack = new SlackClient(process.env.SLACK_ACCESS_TOKEN);

// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET);

// Homepage
app.get('/', (req, res) => {
  const url = `https://${req.hostname}/slack/events`;
  res.setHeader('Content-Type', 'text/html');

  return res.send(`<pre>Copy this link to paste into the event URL field: <a href="${url}">${url}</a></pre>`);
});

// *** Plug the event adapter into the express app as middleware ***
app.use('/slack/events', slackEvents.expressMiddleware());
// *** Attach listeners to the event adapter ***

// *** Greeting any user that says "hi" ***
slackEvents.on('app_mention', (message) => {
  
  if(message.text.includes('hi')){
    sendHi(slack, message);
  }
//   if(message.text.includes('fruit')){
    
//     slack.chat.postMessage({
//       channel: message.channel,
//       text: `FRUIT <@${message.user}> did you just ask for a fruit?`
//     })
//     .catch(console.error);
   
//   }
  
});


// *** Responding to reactions with the same emoji ***
slackEvents.on('reaction_added', (event) => {
  // Respond to the reaction back with the same emoji
  slack.chat.postMessage({
    channetl: event.item.channel,
    text: `:${event.reaction}:`
  })
  .catch(console.error);  
});

//checks message for negativity
slackEvents.on('message', (message) => {
  if (message.subtype == "bot_message") return; //blacklist bots
  if (message.subtype == "slackbot_response") return; //blacklist slackbot
  //if (message.channel != "CEH8S2P1T") return; //whitelist testing server

  
  var str = message.text;
  var res = str.split(" ");
  
  var arrayLength = res.length;
  for (var i = 0; i < arrayLength; i++) {
  if(fruitnames.includes(res[i].toLowerCase())) {
    slack.chat.postMessage({    
      channel: message.channel,  
      text: `That's not inclusive.  :thumbsdown:`,
      thread_ts: message.ts
    })
    return;
     }
  }
  negativity(slack, message);
});


// *** Handle errors ***
slackEvents.on('error', (error) => {
  if (error.code === slackEventsApi.errorCodes.TOKEN_VERIFICATION_FAILURE) {
    // This error type also has a `body` propery containing the request body which failed verification.
    console.error(`An unverified request was sent to the Slack events Request URL. Request body: \
${JSON.stringify(error.body)}`);
  } else {
    console.error(`An error occurred while handling a Slack event: ${error.message}`);
  }
});

// Start the express application
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});