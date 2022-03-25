import { removeLocal, setLocal } from './storage.js';
import { clearContextMenu, createContextMenu, updateContextMenu } from './context-menu.js';
import { setBrowserAction } from './browser-action.js';
import { loadSignedInUser } from './identity.js';
import { isChromiumBasedBrowser } from './user-agent.js';
import { modifyRequestUrls, modifyRequestHeaders, modifyResponseHeaders } from './modifier.js';
import { loadProfilesFromStorage } from './worker-data-manager.js';

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

  // Chrome 72+ requires 'extraHeaders' to be added for some headers to be modifiable.
  // Older versions break with it.
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
  await resetBadge();
  await resetContextMenu();
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, onTabUpdated);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    return;
  }
  chrome.windows.get(windowId, { populate: true }, async (win) => {
    for (const tab of win.tabs) {
      if (tab.active) {
        await onTabUpdated(tab);
        break;
      }
    }
  });
});

async function resetContextMenu() {
  if (chromeLocal.isPaused) {
    await updateContextMenu('pause', {
      title: 'Unpause ModHeader',
      contexts: ['browser_action'],
      onclick: async () => {
        await removeLocal('isPaused');
      }
    });
  } else {
    await updateContextMenu('pause', {
      title: 'Pause ModHeader',
      contexts: ['browser_action'],
      onclick: async () => {
        await setLocal({ isPaused: true });
      }
    });
  }
  if (chromeLocal.lockedTabId) {
    await updateContextMenu('lock', {
      title: 'Unlock to all tabs',
      contexts: ['browser_action'],
      onclick: async () => {
        await removeLocal('lockedTabId');
      }
    });
  } else {
    await updateContextMenu('lock', {
      title: 'Lock to this tab',
      contexts: ['browser_action'],
      onclick: async () => {
        await setLocal({ lockedTabId: chromeLocal.activeTabId });
      }
    });
  }
}

async function resetBadge() {
  if (chromeLocal.isPaused) {
    await setBrowserAction({
      icon: 'images/icon_bw.png',
      text: '\u275A\u275A',
      color: '#666'
    });
  } else {
    let numHeaders = 0;
    for (const currentProfile of activeProfiles) {
      numHeaders +=
        currentProfile.headers.length +
        currentProfile.respHeaders.length +
        currentProfile.urlReplacements.length;
    }
    if (numHeaders === 0) {
      await setBrowserAction({
        icon: 'images/icon_bw.png',
        text: '',
        color: '#ffffff'
      });
    } else if (chromeLocal.lockedTabId && chromeLocal.lockedTabId !== chromeLocal.activeTabId) {
      await setBrowserAction({
        icon: 'images/icon_bw.png',
        text: '\uD83D\uDD12',
        color: '#ff8e8e'
      });
    } else {
      await setBrowserAction({
        icon: 'images/icon.png',
        text: numHeaders.toString(),
        color: selectedActiveProfile.backgroundColor
      });
    }
  }
}

async function initialize() {
  await clearContextMenu();
  await createContextMenu({
    id: 'pause',
    title: 'Pause',
    contexts: ['browser_action']
  });
  await createContextMenu({
    id: 'lock',
    title: 'Lock',
    contexts: ['browser_action']
  });
  await loadProfilesFromStorage(async (params) => {
    chromeLocal = params.chromeLocal;
    activeProfiles = params.activeProfiles;
    selectedActiveProfile = params.selectedActiveProfile;
    setupHeaderModListener();
    await resetBadge();
    await resetContextMenu();
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
  switch (request.type) {
    case 'EXISTS':
      sendResponse({ success: true });
      break;
    case 'IMPORT':
      chromeLocal.profiles.push(JSON.parse(request.profile));
      await setLocal({ profiles: chromeLocal.profiles });
      sendResponse({ success: true });
      break;
    case 'SWITCH_TO_LATEST':
      await setLocal({ selectedProfile: chromeLocal.profiles.length - 1 });
      sendResponse({ success: true });
      break;
    default:
      break;
  }
});

window.saveToStorage = function (items) {
  return setLocal(items);
};

initialize();
