export async function initStorage() {
  if (localStorage.profiles) {
    await setLocal({
      profiles: JSON.parse(localStorage.profiles),
      selectedProfile: localStorage.selectedProfile,
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
