function sendModHeaderMessage(payload, callback) {
  chrome.runtime
    .sendMessage(payload)
    .then((res) => {
      callback(JSON.stringify(res));
    })
    .catch((err) => {
      callback(JSON.stringify(err));
    });
}

exportFunction(sendModHeaderMessage, window, { defineAs: 'sendModHeaderMessage' });
