import lodashIsEqual from 'lodash/isEqual';
import lodashIsUndefined from 'lodash/isUndefined';
import lodashClone from 'lodash/clone';
import { initStorage, getLocal, setLocal, removeLocal } from './storage';

const SPECIAL_CHARS = '^$&+?.()|{}[]/'.split('');
const MAX_PROFILES_IN_CLOUD = 50;
const CHROME_VERSION = getChromeVersion();
let chromeLocal = {
  isPaused: true,
};
let currentProfile;
let tabUrls = {};

/**
 * Check whether the current request url pass the given list of filters.
 */
function passFilters_(url, type, filters) {
  if (!filters) {
    return true;
  }
  let allowUrls = undefined;
  let hasUrlFilters = false;
  let allowTypes = false;
  let hasResourceTypeFilters = false;
  for (let filter of filters) {
    if (filter.enabled) {
      switch (filter.type) {
        case 'urls':
          hasUrlFilters = true;
          if (allowUrls === undefined) {
            allowUrls = false;
          }
          if (url.search(filter.urlRegex) == 0) {
            allowUrls = true;
          }
          break;
        case 'excludeUrls':
          hasUrlFilters = true;
          if (allowUrls === undefined) {
            allowUrls = true;
          }
          if (url.search(filter.urlRegex) == 0) {
            allowUrls = false;
          }
          break;
        case 'types':
          hasResourceTypeFilters = true;
          if (filter.resourceType.indexOf(type) >= 0) {
            allowTypes = true;
          }
          break;
      }
    }
  }
  return (
    (!hasUrlFilters || allowUrls) && (!hasResourceTypeFilters || allowTypes)
  );
}

async function loadSelectedProfile_() {
  let selectedProfile;
  if (chromeLocal.profiles) {
    const profiles = chromeLocal.profiles;
    selectedProfile = profiles[chromeLocal.selectedProfile];

    function filterEnabled_(rows) {
      let output = [];
      if (rows) {
        for (let row of rows) {
          // Overrides the header if it is enabled and its name is not empty.
          if (row.enabled && row.name) {
            output.push({ name: row.name, value: row.value });
          }
        }
      }
      return output;
    }
    selectedProfile.headers = filterEnabled_(selectedProfile.headers);
    selectedProfile.respHeaders = filterEnabled_(selectedProfile.respHeaders);
    selectedProfile.urlReplacements = filterEnabled_(selectedProfile.urlReplacements);
  }
  return selectedProfile;
}

function replaceUrls(urlReplacements, url) {
  if (urlReplacements) {
    for (const replacement of urlReplacements) {
      url = url.replace(replacement.name, replacement.value);
    }
  }
  return url;
}

function modifyHeader(source, dest) {
  if (!source.length) {
    return;
  }
  // Create an index map so that we can more efficiently override
  // existing header.
  const indexMap = {};
  for (const index in dest) {
    const header = dest[index];
    indexMap[header.name.toLowerCase()] = index;
  }
  for (let header of source) {
    const normalizedHeaderName = header.name.toLowerCase();
    const index = indexMap[normalizedHeaderName];
    if (index !== undefined) {
      if (!currentProfile.appendMode || currentProfile.appendMode === 'false') {
        dest[index].value = header.value;
      } else if (currentProfile.appendMode == 'comma') {
        if (dest[index].value) {
          dest[index].value += ',';
        }
        dest[index].value += header.value;
      } else {
        dest[index].value += header.value;
      }
    } else {
      dest.push({ name: header.name, value: header.value });
      indexMap[normalizedHeaderName] = dest.length - 1;
    }
  }
}

function modifyRequestHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  if (details.type == 'main_frame' && details.url && details.tabId >= 0) {
    tabUrls[details.tabId] = details.url;
    chromeLocal.activeTabId = details.tabId;
    chrome.tabs.get(details.tabId, onTabUpdated);
  }
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId == details.tabId) {
    if (
      currentProfile &&
      passFilters_(details.url, details.type, currentProfile.filters)
    ) {
      const newUrl = replaceUrls(currentProfile.urlReplacements, details.url);
      if (newUrl !== details.url) {
        return { redirectUrl: newUrl };
      }
    }
  }
  return {};
}

function modifyRequestHeaderHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId == details.tabId) {
    if (
      currentProfile &&
      passFilters_(details.url, details.type, currentProfile.filters)
    ) {
      modifyHeader(currentProfile.headers, details.requestHeaders);
    }
  }
  return { requestHeaders: details.requestHeaders };
}

function modifyResponseHeaderHandler_(details) {
  if (chromeLocal.isPaused) {
    return {};
  }
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId == details.tabId) {
    if (
      currentProfile &&
      passFilters_(details.url, details.type, currentProfile.filters)
    ) {
      const responseHeaders = lodashClone(details.responseHeaders);
      modifyHeader(currentProfile.respHeaders, responseHeaders);
      if (!lodashIsEqual(responseHeaders, details.responseHeaders)) {
        return {
          responseHeaders: responseHeaders
        };
      }
    }
  }
}

function getChromeVersion() {
  let pieces = navigator.userAgent.match(
    /Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/
  );
  if (pieces == null || pieces.length != 5) {
    return {};
  }
  pieces = pieces.map(piece => parseInt(piece, 10));
  return {
    major: pieces[1],
    minor: pieces[2],
    build: pieces[3],
    patch: pieces[4]
  };
}

function setupHeaderModListener() {
  chrome.webRequest.onBeforeRequest.removeListener(modifyRequestHandler_);
  chrome.webRequest.onBeforeSendHeaders.removeListener(
    modifyRequestHeaderHandler_
  );
  chrome.webRequest.onHeadersReceived.removeListener(
    modifyResponseHeaderHandler_
  );

  // Chrome 72+ requires 'extraHeaders' to be added for some headers to be modifiable.
  // Older versions break with it.
  if (currentProfile.headers.length > 0) {
    let requiresExtraRequestHeaders = false;
    if (CHROME_VERSION.major >= 72) {
      requiresExtraRequestHeaders = true;
    }
    chrome.webRequest.onBeforeSendHeaders.addListener(
      modifyRequestHeaderHandler_,
      { urls: ['<all_urls>'] },
      requiresExtraRequestHeaders
        ? ['requestHeaders', 'blocking', 'extraHeaders']
        : ['requestHeaders', 'blocking']
    );
  }
  if (currentProfile.respHeaders.length > 0) {
    let requiresExtraResponseHeaders = false;
    if (CHROME_VERSION.major >= 72) {
      requiresExtraResponseHeaders = true;
    }
    chrome.webRequest.onHeadersReceived.addListener(
      modifyResponseHeaderHandler_,
      { urls: ['<all_urls>'] },
      requiresExtraResponseHeaders
        ? ['responseHeaders', 'blocking', 'extraHeaders']
        : ['responseHeaders', 'blocking']
    );
  }

  if (currentProfile.urlReplacements.length > 0) {
    chrome.webRequest.onBeforeRequest.addListener(
      modifyRequestHandler_,
      { urls: ['<all_urls>'] },
      ['blocking']
    );
  }
}

async function onTabUpdated(tab) {
  if (tab.active) {
    await removeLocal('currentTabUrl');
    // Since we don't have access to the "tabs" permission, we may not have
    // access to the url property all the time. So, match it against the URL
    // found during request modification.
    let url = tab.url;
    if (url) {
      tabUrls[tab.id] = url;
    } else {
      url = tabUrls[tab.id];
    }
    await setLocal({ activeTabId: tab.id });

    // Only set the currentTabUrl property if the tab is active and the window
    // is in focus.
    chrome.windows.get(tab.windowId, {}, async win => {
      if (win.focused) {
        await setLocal({ currentTabUrl: url });
      }
    });
    if (!url) {
      return;
    }
    resetBadgeAndContextMenu();
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  await onTabUpdated(tab);
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, onTabUpdated);
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId == chrome.windows.WINDOW_ID_NONE) {
    return;
  }
  chrome.windows.get(windowId, { populate: true }, async win => {
    for (let tab of win.tabs) {
      await onTabUpdated(tab);
    }
  });
});

function saveStorageToCloud() {
  chrome.storage.sync.get(null, async items => {
    const keys = items ? Object.keys(items) : [];
    keys.sort();
    if (
      keys.length == 0 ||
      items[keys[keys.length - 1]] != chromeLocal.profiles
    ) {
      const data = {};
      data[Date.now()] = chromeLocal.profiles;
      chrome.storage.sync.set(data);
      await setLocal({
        savedToCloud: true
      });
    }
    if (keys.length >= MAX_PROFILES_IN_CLOUD) {
      chrome.storage.sync.remove(
        keys.slice(0, keys.length - MAX_PROFILES_IN_CLOUD)
      );
    }
  });
}

function createContextMenu() {
  if (chromeLocal.isPaused) {
    chrome.contextMenus.update('pause', {
      title: 'Unpause ModHeader',
      contexts: ['browser_action'],
      onclick: async () => {
        await removeLocal('isPaused');
      }
    });
  } else {
    chrome.contextMenus.update('pause', {
      title: 'Pause ModHeader',
      contexts: ['browser_action'],
      onclick: async () => {
        await setLocal({isPaused: true});
      }
    });
  }
  if (chromeLocal.lockedTabId) {
    chrome.contextMenus.update('lock', {
      title: 'Unlock to all tabs',
      contexts: ['browser_action'],
      onclick: async () => {
        await removeLocal('lockedTabId');
      }
    });
  } else {
    chrome.contextMenus.update('lock', {
      title: 'Lock to this tab',
      contexts: ['browser_action'],
      onclick: async () => {
        await setLocal({lockedTabId: chromeLocal.activeTabId});
      }
    });
  }
}

function resetBadgeAndContextMenu() {
  if (chromeLocal.isPaused) {
    chrome.browserAction.setIcon({ path: 'images/icon_bw.png' });
    chrome.browserAction.setBadgeText({ text: '\u275A\u275A' });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#666' });
  } else {
    if (
      chromeLocal.lockedTabId &&
      chromeLocal.lockedTabId != chromeLocal.activeTabId
    ) {
      chrome.browserAction.setIcon({ path: 'images/icon_bw.png' });
      chrome.browserAction.setBadgeText({ text: '\uD83D\uDD12' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#ff8e8e' });
    } else {
      chrome.browserAction.setIcon({ path: 'images/icon.png' });
      chrome.browserAction.setBadgeText({ text: currentProfile.shortTitle });
      chrome.browserAction.setBadgeBackgroundColor({ color: currentProfile.backgroundColor });
    }
  }
  createContextMenu();
}

async function initializeStorage() {
  chromeLocal = await initStorage();
  currentProfile = await loadSelectedProfile_();
  setupHeaderModListener();
  resetBadgeAndContextMenu();

  // Async initialization.
  setTimeout(async () => {
    if (chromeLocal.profiles && !chromeLocal.savedToCloud) {
      saveStorageToCloud();
    }

    if (!chromeLocal.profiles) {
      chrome.storage.sync.get(null, async items => {
        const keys = items ? Object.keys(items) : [];
        keys.sort();
        if (keys.length > 0) {
          await setLocal({
            profiles: items[keys[keys.length - 1]],
            savedToCloud: true,
          });
        }
      });
    }
  }, 100);
  
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }
    const profilesUpdated = !lodashIsUndefined(changes.profiles)
        && !lodashIsEqual(chromeLocal.profiles, changes.profiles.newValue);
    const selectedProfileUpdated = !lodashIsUndefined(changes.selectedProfile)
        && !lodashIsEqual(chromeLocal.selectedProfile, changes.selectedProfile.newValue);
    for (const [key, value] of Object.entries(changes)) {
      chromeLocal[key] = value.newValue;
    }
    if (profilesUpdated || selectedProfileUpdated) {
      currentProfile = await loadSelectedProfile_();
      saveStorageToCloud();
    }
    setupHeaderModListener();
    resetBadgeAndContextMenu();
  });
}
chrome.contextMenus.create({
  id: 'pause',
  title: 'Pause',
  contexts: ['browser_action']
});
chrome.contextMenus.create({
  id: 'lock',
  title: 'Lock',
  contexts: ['browser_action']
});
initializeStorage();

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://r.bewisse.com/modheader/postinstall' });
  }
});

window.saveToStorage = async function(items) {
  await setLocal(items);
};
