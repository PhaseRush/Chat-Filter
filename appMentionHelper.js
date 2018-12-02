module.exports = {
  sendHi: function(slack, message) {
  slack.chat.postMessage({
      channel: message.channel,
      text: `hello <@${message.user}> how are you?`,
    })
    
    .catch(console.error);
  },
}

