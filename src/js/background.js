import { setLocal } from './storage.js';
import { resetBrowserActions } from './browser-action-manager.js';
import { loadSignedInUser } from './identity.js';
import { isChromiumBasedBrowser } from './user-agent.js';
import { modifyRequestUrls, modifyRequestHeaders, modifyResponseHeaders } from './modifier.js';
import { loadProfilesFromStorage } from './worker-data-manager.js';
import { onMessageReceived } from './message-handler.js';
import { onCommandReceived } from './command-handler.js';
import { addTabUpdatedListener } from './tabs.js';
import { initContextMenu, resetContextMenu } from './context-menu-manager.js';

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
  chrome.webRequest.onBeforeRequest.removeListener(modifyRequestHandler_);
  chrome.webRequest.onBeforeSendHeaders.removeListener(modifyRequestHeaderHandler_);
  chrome.webRequest.onHeadersReceived.removeListener(modifyResponseHeaderHandler_);

  let hasRequestHeadersModification = false;
  let hasResponseHeadersModification = false;
  let hasUrlReplacement = false;
  for (const currentProfile of activeProfiles) {
    if (currentProfile.headers.length > 0) {
      hasRequestHeadersModification = true;
    }
    if (currentProfile.respHeaders.length > 0) {
      hasResponseHeadersModification = true;
    }
    if (currentProfile.urlReplacements.length > 0) {
      hasUrlReplacement = true;
    }
  }
  // Chrome 72+ requires 'extraHeaders' to be added for some headers to be modifiable.
  // Firefox will break with it.
  if (hasRequestHeadersModification) {
    chrome.webRequest.onBeforeSendHeaders.addListener(
      modifyRequestHeaderHandler_,
      { urls: ['<all_urls>'] },
      isChromiumBasedBrowser()
        ? ['requestHeaders', 'blocking', 'extraHeaders']
        : ['requestHeaders', 'blocking']
    );
  }
  if (hasResponseHeadersModification) {
    chrome.webRequest.onHeadersReceived.addListener(
      modifyResponseHeaderHandler_,
      { urls: ['<all_urls>'] },
      isChromiumBasedBrowser()
        ? ['responseHeaders', 'blocking', 'extraHeaders']
        : ['responseHeaders', 'blocking']
    );
  }

  if (hasUrlReplacement) {
    chrome.webRequest.onBeforeRequest.addListener(modifyRequestHandler_, { urls: ['<all_urls>'] }, [
      'blocking'
    ]);
  }
}

async function onTabUpdated(tab) {
  await setLocal({ activeTabId: tab.id });
  await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });
  await resetContextMenu(chromeLocal);
}

async function initialize() {
  addTabUpdatedListener(onTabUpdated);
  await initContextMenu(chromeLocal);
  await loadProfilesFromStorage(async (params) => {
    chromeLocal = params.chromeLocal;
    activeProfiles = params.activeProfiles;
    selectedActiveProfile = params.selectedActiveProfile;
    setupHeaderModListener();
    await resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile });
    await resetContextMenu(chromeLocal);
  });

  chrome.webRequest.onSendHeaders.removeListener(loadSignedInUser);
  chrome.webRequest.onSendHeaders.addListener(loadSignedInUser, {
    urls: [process.env.CHECK_LOGIN_URL, `${process.env.CHECK_LOGIN_URL}?*`]
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

initialize();
