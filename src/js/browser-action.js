async function setIcon(args) {
  return new Promise((resolve, reject) => chrome.browserAction.setIcon(args, resolve));
}

async function setBadgeText(args) {
  return new Promise((resolve, reject) => chrome.browserAction.setBadgeText(args, resolve));
}


async function setBadgeBackgroundColor(args) {
  return new Promise((resolve, reject) => chrome.browserAction.setBadgeBackgroundColor(args, resolve));
}

export async function setBrowserAction({ icon, text, color }) {
  await Promise.all([setIcon({ path: icon }), setBadgeText({ text }), setBadgeBackgroundColor({ color })]);
}
