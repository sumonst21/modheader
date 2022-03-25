export async function getActiveTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
        windowType: 'normal'
      },
      (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (tabs && tabs.length > 0) {
          resolve(tabs[0]);
        } else {
          resolve(undefined);
        }
      }
    );
  });
}

export function addTabUpdatedListener(callback) {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, callback);
  });

  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      return;
    }
    chrome.windows.get(windowId, { populate: true }, async (win) => {
      for (const tab of win.tabs) {
        if (tab.active) {
          await callback(tab);
          break;
        }
      }
    });
  });
}
