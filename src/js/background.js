import { setLocal } from './storage.js';
import { resetBrowserActions } from './browser-action-manager.js';
import { loadSignedInUser } from './identity.js';
import { modifyRequestUrls, modifyRequestHeaders, modifyResponseHeaders } from './modifier.js';
import { loadProfilesFromStorage } from './worker-data-manager.js';
import { onMessageReceived } from './message-handler.js';
import { onCommandReceived } from './command-handler.js';
import { setupTabUpdatedListener } from './tabs.js';
import { initContextMenu, resetContextMenu } from './context-menu-manager.js';
import {
  addBeforeRequestListener,
  addBeforeSendHeadersListener,
  addHeadersReceivedListener,
  removeBeforeRequestListener,
  removeBeforeSendHeadersListener,
  removeHeadersReceivedListener
} from './web-request.js';

const ALL_URLS_FILTER = ['<all_urls>'];

let chromeLocal = {
  isPaused: true
};
let selectedActiveProfile;
let activeProfiles = [];

function modifyRequestHandler_(details) {
  return modifyRequestUrls({ chromeLocal, activeProfiles, details });
}

function modifyRequestHeaderHandler_(details) {
  return modifyRequestHeaders({ chromeLocal, activeProfiles, details });
}

function modifyResponseHeaderHandler_(details) {
  return modifyResponseHeaders({ chromeLocal, activeProfiles, details });
}

function setupHeaderModListener() {
  if (activeProfiles.find((p) => p.urlReplacements.length > 0)) {
    addBeforeRequestListener(modifyRequestHandler_, ALL_URLS_FILTER);
  } else {
    removeBeforeRequestListener(modifyRequestHandler_);
  }
  if (activeProfiles.find((p) => p.headers.length > 0 || p.cookieHeaders.length > 0)) {
    addBeforeSendHeadersListener(modifyRequestHeaderHandler_, ALL_URLS_FILTER);
  } else {
    removeBeforeSendHeadersListener(modifyRequestHeaderHandler_);
  }
  if (activeProfiles.find((p) => p.respHeaders.length > 0 || p.setCookieHeaders.length > 0)) {
    addHeadersReceivedListener(modifyResponseHeaderHandler_, ALL_URLS_FILTER);
  } else {
    removeHeadersReceivedListener(modifyResponseHeaderHandler_);
  }
}

async function initialize() {
  await setupTabUpdatedListener();
  await initContextMenu();
  await loadProfilesFromStorage(async (params) => {
    chromeLocal = params.chromeLocal;
    activeProfiles = params.activeProfiles;
    selectedActiveProfile = params.selectedActiveProfile;
    setupHeaderModListener();
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });
    await resetContextMenu(chromeLocal);
  });
}

async function messageHandler(request, sender, sendResponse) {
  if (sender.origin && !sender.origin.startsWith(process.env.URL_BASE)) {
    sendResponse({ error: 'Unsupported origin' });
    return true;
  }
  const response = await onMessageReceived({ chromeLocal, request });
  if (response) {
    sendResponse(response);
  }
}

if (process.env.BROWSER === 'firefox') {
  // Firefox does not allow web pages to directly communicate with background page, so we need to
  // expose a function via content script that can post internal message to background page.
  // See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    messageHandler(request, sender, sendResponse);
    return true;
  });
} else {
  chrome.runtime.onMessageExternal.addListener(messageHandler);
}

chrome.commands.onCommand.addListener(async (command) => {
  await onCommandReceived(chromeLocal, command);
});

window.saveToStorage = function (items) {
  return setLocal(items);
};

await initialize();
