import { createHeader, takeRight, generateBackgroundColor, generateTextColor } from './utils';
import lodashIsUndefined from 'lodash/isUndefined';

export function fixProfiles(profiles) {
  let isMutated = false;
  if (profiles.length == 0) {
    profiles.push({
      title: 'Profile 1',
      hideComment: true,
      headers: [createHeader()],
      respHeaders: [],
      filters: [],
      urlReplacements: [],
      appendMode: false,
      backgroundColor: generateBackgroundColor(),
      textColor: generateTextColor(),
      shortTitle: '1',
    });
    isMutated = true;
  }
  for (let index in profiles) {
    const profile = profiles[index];
    if (!profile.title) {
      profile.title = 'Profile ' + (index + 1);
      isMutated = true;
    }
    if (!profile.shortTitle) {
      profile.shortTitle = takeRight(index + 1);
      isMutated = true;
    }
    if (!profile.headers) {
      profile.headers = [createHeader()];
      isMutated = true;
    }
    if (!profile.respHeaders) {
      profile.respHeaders = [];
      isMutated = true;
    }
    if (!profile.urlReplacements) {
      profile.urlReplacements = [];
      isMutated = true;
    }
    if (!profile.filters) {
      profile.filters = [];
    }
    for (let filter of profile.filters) {
      if (!filter.resourceType) {
        filter.resourceType = [];
        isMutated = true;
      }
    }
    if (!profile.backgroundColor) {
      profile.backgroundColor = generateBackgroundColor();
      isMutated = true;
    }
    if (!!profile.textColor) {
      profile.textColor = generateTextColor();
      isMutated = true;
    }
  }
  return isMutated;
}

export async function initStorage() {
  if (localStorage.profiles) {
    const profiles = JSON.parse(localStorage.profiles);
    fixProfiles(profiles);
    let profileIndex = 0;
    if (localStorage.selectedProfile) {
      profileIndex = Number(localStorage.selectedProfile);
    }
    if (!(profileIndex >= 0 && profileIndex < profiles.length)) {
      profileIndex = profiles.length - 1;
    }
    await setLocal({
      profiles,
      selectedProfile: profileIndex,
      lockedTabId: localStorage.lockedTabId,
      isPaused: localStorage.isPaused,
      activeTabId: localStorage.activeTabId,
      savedToCloud: localStorage.savedToCloud,
      currentTabUrl: localStorage.currentTabUrl
    });
    delete localStorage.profiles;
    delete localStorage.selectedProfile;
    delete localStorage.lockedTabId;
    delete localStorage.isPaused;
    delete localStorage.activeTabId;
    delete localStorage.savedToCloud;
    delete localStorage.currentTabUrl;
  }
  const chromeLocal = await getLocal();
  let isMutated = false;
  if (lodashIsUndefined(chromeLocal.profiles)) {
    chromeLocal.profiles = [];
    isMutated = true;
  }
  isMutated = fixProfiles(chromeLocal.profiles);
  if (lodashIsUndefined(chromeLocal.selectedProfile) ||
      chromeLocal.selectedProfile < 0 ||
      chromeLocal.selectedProfile >= chromeLocal.profiles.length) {
    chromeLocal.selectedProfile = chromeLocal.profiles.length - 1;
    isMutated = true;
  }
  if (isMutated) {
    await setLocal(chromeLocal);
  }
  return chromeLocal;
}

export async function getLocal(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items);
      }
    });
  });
}

export async function setLocal(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function removeLocal(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function getSync(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items);
      }
    });
  });
}

export async function setSync(items) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export async function removeSync(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove(keys, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}
