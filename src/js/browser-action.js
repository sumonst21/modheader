async function setIcon(args) {
  return new Promise((resolve) => chrome.browserAction.setIcon(args, resolve));
}

async function setBadgeText(args) {
  return new Promise((resolve) => chrome.browserAction.setBadgeText(args, resolve));
}

async function setBadgeBackgroundColor(args) {
  return new Promise((resolve) => chrome.browserAction.setBadgeBackgroundColor(args, resolve));
}

export async function setBrowserAction({ icon, text, color }) {
  await Promise.all([
    setIcon({ path: icon }),
    setBadgeText({ text }),
    setBadgeBackgroundColor({ color })
  ]);
}
