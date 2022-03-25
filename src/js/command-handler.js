import { removeLocal, setLocal } from './storage.js';

async function switchToProfile(chromeLocal, index) {
  if (index < chromeLocal.profiles.length) {
    await setLocal({ selectedProfile: index });
  }
}

export async function onCommandReceived(chromeLocal, command) {
  switch (command) {
    case 'toggle_pause':
      if (chromeLocal.isPaused) {
        await removeLocal('isPaused');
      } else {
        await setLocal({ isPaused: true });
      }
      break;
    case 'toggle_lock':
      if (chromeLocal.lockedTabId) {
        await removeLocal('lockedTabId');
      } else {
        await setLocal({ lockedTabId: chromeLocal.activeTabId });
      }
      break;
    case 'switch_to_profile_1':
      await switchToProfile(chromeLocal, 0);
      break;
    case 'switch_to_profile_2':
      await switchToProfile(chromeLocal, 1);
      break;
    case 'switch_to_profile_3':
      await switchToProfile(chromeLocal, 2);
      break;
    case 'switch_to_profile_4':
      await switchToProfile(chromeLocal, 3);
      break;
  }
}
