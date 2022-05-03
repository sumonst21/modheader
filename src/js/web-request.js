import { isChromiumBasedBrowser } from './user-agent.js';

const cache = {};

function addListener(type, listenerParams) {
  if (cache[type]) {
    return;
  }
  chrome.webRequest[type].addListener(
    listenerParams.callback,
    listenerParams.filter,
    listenerParams.extraInfoSpec
  );
}

function removeListener(type, callback) {
  if (!cache[type]) {
    return;
  }
  chrome.webRequest[type].removeListener(callback);
}

export function addBeforeSendHeadersListener(callback, urls) {
  addListener('onBeforeSendHeaders', {
    callback,
    filter: { urls },
    // Chrome 72+ requires 'extraHeaders' to be added for some headers to be modifiable.
    // Firefox will break with it.
    extraInfoSpec: isChromiumBasedBrowser()
      ? ['requestHeaders', 'blocking', 'extraHeaders']
      : ['requestHeaders', 'blocking']
  });
}

export function removeBeforeSendHeadersListener(callback) {
  removeListener('onBeforeSendHeaders', callback);
}

export function addBeforeRequestListener(callback, urls) {
  addListener('onBeforeRequest', {
    callback,
    filter: { urls },
    extraInfoSpec: ['blocking']
  });
}

export function removeBeforeRequestListener(callback) {
  removeListener('onBeforeRequest', callback);
}

export function addHeadersReceivedListener(callback, urls) {
  addListener('onHeadersReceived', {
    callback,
    filter: { urls },
    // Chrome 72+ requires 'extraHeaders' to be added for some headers to be modifiable.
    // Firefox will break with it.
    extraInfoSpec: isChromiumBasedBrowser()
      ? ['responseHeaders', 'blocking', 'extraHeaders']
      : ['responseHeaders', 'blocking']
  });
}

export function removeHeadersReceivedListener(callback) {
  removeListener('onHeadersReceived', callback);
}
