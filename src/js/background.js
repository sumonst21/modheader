import lodashIsEqual from 'lodash/isEqual.js';
import lodashIsUndefined from 'lodash/isUndefined.js';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import { initStorage } from './storage-loader.js';
import { getSync, removeLocal, removeSync, setLocal, setSync } from './storage.js';
import { clearContextMenu, createContextMenu, updateContextMenu } from './context-menu.js';
import { setBrowserAction } from './browser-action.js';
import { loadSignedInUser } from './identity.js';
import { isChromiumBasedBrowser } from './user-agent.js';
import { filterEnabledMods, evaluateValue } from './utils.js';
import { optimizeFilters, passFilters } from './filter.js';
import { optimizeUrlRedirects, redirectUrl } from './url-redirect.js';

const MAX_PROFILES_IN_CLOUD = 50;
let chromeLocal = {
  isPaused: true
};
let selectedActiveProfile;
let activeProfiles = [];

function loadActiveProfiles() {
  activeProfiles = [];
  selectedActiveProfile = undefined;
  if (chromeLocal.profiles) {
    const profiles = chromeLocal.profiles;
    for (const [i, value] of profiles.entries()) {
      if (i !== chromeLocal.selectedProfile && !value.alwaysOn) {
        continue;
      }
      const profile = lodashCloneDeep(value);
      profile.headers = filterEnabledMods(profile.headers);
      profile.respHeaders = filterEnabledMods(profile.respHeaders);
      profile.urlReplacements = optimizeUrlRedirects(profile.urlReplacements);
      profile.filters = optimizeFilters(profile.filters);
      if (i === chromeLocal.selectedProfile) {
        selectedActiveProfile = value;
      }
      activeProfiles.push(profile);
    }
  }
}

function modifyHeader(url, currentProfile, source, dest) {
  if (!source.length) {
    return;
  }
  // Create an index map so that we can more efficiently override
  // existing header.
  const indexMap = {};
  for (let index = 0; index < dest.length; index++) {
    const header = dest[index];
    indexMap[header.name.toLowerCase()] = index;
  }
  for (const header of source) {
    const normalizedHeaderName = header.name.toLowerCase();
    const index = indexMap[normalizedHeaderName];
    const headerValue = evaluateValue({
      value: header.value,
      url,
      oldUrl: index !== undefined ? dest[index].value : undefined
    });
    if (index !== undefined) {
      if (!currentProfile.appendMode || currentProfile.appendMode === 'false') {
        dest[index].value = headerValue;
      } else if (currentProfile.appendMode === 'comma') {
        if (dest[index].value) {
          dest[index].value += ',';
        }
        dest[index].value += headerValue;
      } else {
        dest[index].value += headerValue;
      }
    } else {
      dest.push({ name: header.name, value: headerValue });
      indexMap[normalizedHeaderName] = dest.length - 1;
    }
  }
}

function modifyRequestHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  let newUrl = details.url;
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId) {
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: newUrl, type: details.type, filters: currentProfile.filters })) {
        newUrl = redirectUrl({ urlRedirects: currentProfile.urlReplacements, url: newUrl });
      }
    }
  }
  if (newUrl !== details.url) {
    return { redirectUrl: newUrl };
  }
  return {};
}

function modifyRequestHeaderHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId) {
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, filters: currentProfile.filters })) {
        modifyHeader(details.url, currentProfile, currentProfile.headers, details.requestHeaders);
        if (!currentProfile.sendEmptyHeader) {
          details.requestHeaders = details.requestHeaders.filter((entry) => !!entry.value);
        }
      }
    }
  }
  return {
    requestHeaders: details.requestHeaders
  };
}

function modifyResponseHeaderHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  let responseHeaders = lodashCloneDeep(details.responseHeaders);
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId) {
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, filters: currentProfile.filters })) {
        modifyHeader(details.url, currentProfile, currentProfile.respHeaders, responseHeaders);
        if (!currentProfile.sendEmptyHeader) {
          responseHeaders = responseHeaders.filter((entry) => !!entry.value);
        }
      }
    }
  }
  if (!lodashIsEqual(responseHeaders, details.responseHeaders)) {
    return {
      responseHeaders
    };
  }
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

async function saveStorageToCloud() {
  const items = await getSync();
  const keys = items ? Object.keys(items) : [];
  keys.sort();
  if (keys.length === 0 || items[keys[keys.length - 1]] !== chromeLocal.profiles) {
    const data = {};
    data[Date.now()] = chromeLocal.profiles;
    await Promise.all([setSync(data), setLocal({ savedToCloud: true })]);
  }
  if (keys.length >= MAX_PROFILES_IN_CLOUD) {
    await removeSync(keys.slice(0, keys.length - MAX_PROFILES_IN_CLOUD));
  }
}

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
  chromeLocal = await initStorage();
  loadActiveProfiles();
  setupHeaderModListener();
  await resetBadge();
  await resetContextMenu();

  chrome.webRequest.onSendHeaders.removeListener(loadSignedInUser);
  chrome.webRequest.onSendHeaders.addListener(loadSignedInUser, {
    urls: [process.env.CHECK_LOGIN_URL, `${process.env.CHECK_LOGIN_URL}?*`]
  });

  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }
    const profilesUpdated =
      !lodashIsUndefined(changes.profiles) &&
      !lodashIsEqual(chromeLocal.profiles, changes.profiles.newValue);
    const selectedProfileUpdated =
      !lodashIsUndefined(changes.selectedProfile) &&
      !lodashIsEqual(chromeLocal.selectedProfile, changes.selectedProfile.newValue);
    for (const [key, value] of Object.entries(changes)) {
      chromeLocal[key] = value.newValue;
    }
    if (profilesUpdated || selectedProfileUpdated) {
      loadActiveProfiles();
      saveStorageToCloud();
      setupHeaderModListener();
    }
    await resetBadge();
    await resetContextMenu();
  });
}
initialize();

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
