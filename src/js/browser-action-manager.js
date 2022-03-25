import { setBrowserAction } from './browser-action.js';

export async function resetBrowserActions({ chromeLocal, activeProfiles, selectedActiveProfile }) {
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
