const axios = require('axios'); //http requests

module.exports = {
  // message contains "r/xxxx"
  // send the correct link
  subredditLinker: function(slack, message) {
     slack.chat.postMessage({
      channel: message.channel,
      //text: `hello <@${message.user}> you should drink water!`
       text: `from send`
    })
  },
  
  
  
  //start of negativity
  negativity: function(slack, message) {
    
    //console.log("Message text body : ");
    //console.log(message.text);
    
    axios.post( 'https://canadacentral.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment',
               {
         documents: [{
      language: "en",
      id: 1,
      text: message.text
    }]
    },
              {
      headers: {  
                     'Ocp-Apim-Subscription-Key':'a13e2b13961347c3bd72f06bd949d10d',
        'Content-Type' : 'application/json',
        'Accept' :'application/json'  
      }
      
      
    })
      .then(function (response) {
      //console.log("RIGHT BEFORE PRINTING RESPONSE");
      var score = response.data.documents[0].score;
     console.log(score);
      if (score < .5) {
        slack.chat.postMessage({
      channel: message.channel,
       text: `That's not inclusive.  :thumbsdown:`,
          thread_ts: message.ts
    })
      } else if (score > .99) { //can change this threshold
        slack.chat.postMessage({
      channel: message.channel,
       text: `You are a positive person :)`,
          thread_ts:message.ts
    })
      }
    });

  }
}