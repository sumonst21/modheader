import lodashIsEqual from 'lodash/isEqual';
import lodashIsUndefined from 'lodash/isUndefined';
import lodashCloneDeep from 'lodash/cloneDeep';
import { initStorage, setLocal, removeLocal, setSync, getSync, removeSync } from './storage';
import { createContextMenu, updateContextMenu, clearContextMenu } from './context-menu';
import { setBrowserAction } from './browser-action';

const MAX_PROFILES_IN_CLOUD = 50;
const CHROME_VERSION = getChromeVersion();
let chromeLocal = {
  isPaused: true,
};
let currentProfile;

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

function loadSelectedProfile_() {
  let selectedProfile;
  if (chromeLocal.profiles) {
    const profiles = chromeLocal.profiles;
    selectedProfile = lodashCloneDeep(profiles[chromeLocal.selectedProfile]);
    selectedProfile.headers = filterEnabled_(selectedProfile.headers);
    selectedProfile.respHeaders = filterEnabled_(selectedProfile.respHeaders);
    selectedProfile.urlReplacements = filterEnabled_(selectedProfile.urlReplacements);
  }
  return selectedProfile;
}

function evaluateValue(value, url) {
  if (value && value.startsWith('function')) {
    try {
      return (eval(`(${value})({ url: '${url}' })`) || '').toString();
    } catch (err) {
      console.error(err);
    }
  }
  return value;
}

function replaceUrls(urlReplacements, url) {
  if (urlReplacements) {
    for (const replacement of urlReplacements) {
      // Avoid infinite replacement
      const replacementValue = evaluateValue(replacement.value, url);
      if (!url.includes(replacementValue)) {
        url = url.replace(replacement.name, replacementValue);
      }
    }
  }
  return url;
}

function modifyHeader(url, source, dest) {
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
  for (const header of source) {
    const normalizedHeaderName = header.name.toLowerCase();
    const index = indexMap[normalizedHeaderName];
    const headerValue = evaluateValue(header.value, url);
    if (index !== undefined) {
      if (!currentProfile.appendMode || currentProfile.appendMode === 'false') {
        dest[index].value = headerValue;
      } else if (currentProfile.appendMode == 'comma') {
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
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId) {
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
  if (!chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId) {
    if (
      currentProfile &&
      passFilters_(details.url, details.type, currentProfile.filters)
    ) {
      modifyHeader(details.url, currentProfile.headers, details.requestHeaders);
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
      const responseHeaders = lodashCloneDeep(details.responseHeaders);
      modifyHeader(details.url, currentProfile.respHeaders, responseHeaders);
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
  await setLocal({ activeTabId: tab.id });
  await resetBadgeAndContextMenu();
}

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, onTabUpdated);
});

chrome.windows.onFocusChanged.addListener(windowId => {
  if (windowId == chrome.windows.WINDOW_ID_NONE) {
    return;
  }
  chrome.windows.get(windowId, { populate: true }, async win => {
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
  if (
    keys.length == 0 ||
    items[keys[keys.length - 1]] != chromeLocal.profiles
  ) {
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
        await setLocal({isPaused: true});
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

async function resetBadgeAndContextMenu() {
  if (chromeLocal.isPaused) {
    await setBrowserAction({
      icon: 'images/icon_bw.png',
      text: '\u275A\u275A',
      color: '#666'
    });
  } else {
    const numHeaders =
      currentProfile.headers.length + currentProfile.respHeaders.length + currentProfile.urlReplacements.length;
    if (numHeaders == 0) {
      await setBrowserAction({
        icon: 'images/icon_bw.png',
        text: '',
        color: '#ffffff'
      });
    } else if (
      chromeLocal.lockedTabId &&
      chromeLocal.lockedTabId != chromeLocal.activeTabId
    ) {
      await setBrowserAction({
        icon: 'images/icon_bw.png',
        text: '\uD83D\uDD12',
        color: '#ff8e8e'
      });
    } else {
      await setBrowserAction({
        icon: 'images/icon.png',
        text: numHeaders.toString(),
        color: currentProfile.backgroundColor
      });
    }
  }
  await resetContextMenu();
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
  currentProfile = loadSelectedProfile_();
  if (currentProfile) {
    setupHeaderModListener();
    await resetBadgeAndContextMenu();
  }
  
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
      currentProfile = loadSelectedProfile_();
      saveStorageToCloud();
      setupHeaderModListener();
    }
    if (currentProfile) {
      await resetBadgeAndContextMenu();
    }
  });
}
initialize();

chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://r.bewisse.com/modheader/postinstall' });
  }
});

window.saveToStorage = function(items) {
  return setLocal(items);
};
