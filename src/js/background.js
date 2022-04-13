import { setLocal } from './storage.js';
import { resetBrowserActions } from './browser-action-manager.js';
import { loadSignedInUser } from './identity.js';
import { modifyRequestUrls, modifyRequestHeaders, modifyResponseHeaders } from './modifier.js';
import { loadProfilesFromStorage } from './worker-data-manager.js';
import { onMessageReceived } from './message-handler.js';
import { onCommandReceived } from './command-handler.js';
import {addTabUpdatedListener, setupTabUpdatedListener} from './tabs.js';
import { initContextMenu, resetContextMenu } from './context-menu-manager.js';
import {
  addBeforeRequestListener,
  addBeforeSendHeadersListener,
  addHeadersReceivedListener,
  addSendHeadersListener,
  removeBeforeRequestListener,
  removeBeforeSendHeadersListener,
  removeHeadersReceivedListener
} from './web-request.js';

const ALL_URLS_FILTER = ['<all_urls>'];
const LOGIN_URL_FILTER = [
  `${process.env.URL_BASE}/u/extension-signed-in`,
  `${process.env.URL_BASE}/u/extension-signed-in?*`
];

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
  if (activeProfiles.find((p) => p.headers.length > 0)) {
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
  addSendHeadersListener(loadSignedInUser, LOGIN_URL_FILTER);
  await loadProfilesFromStorage(async (params) => {
    chromeLocal = params.chromeLocal;
    activeProfiles = params.activeProfiles;
    selectedActiveProfile = params.selectedActiveProfile;
    setupHeaderModListener();
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });
    await resetContextMenu(chromeLocal);
  });
}

chrome.runtime.onMessageExternal.addListener(async function (request, sender, sendResponse) {
  if (!sender.origin.startsWith(process.env.URL_BASE)) {
    sendResponse({ error: 'Unsupported origin' });
    return;
  }
  if (await onMessageReceived({ chromeLocal, request })) {
    sendResponse({ success: true });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  await onCommandReceived(chromeLocal, command);
});

window.saveToStorage = function (items) {
  return setLocal(items);
};

await initialize();
