import { fixProfiles } from './profile';
import { getLocal, setLocal, getSync } from './storage';
import lodashIsUndefined from 'lodash/isUndefined';
import lodashIsEmpty from 'lodash/isEmpty';

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
  let chromeLocal = await getLocal();
  if (!chromeLocal.profiles) {
    const items = await getSync();
    const keys = items ? Object.keys(items) : [];
    keys.sort();
    if (keys.length > 0) {
      chromeLocal = {
        profiles: items[keys[keys.length - 1]],
        selectedProfile: 0,
        savedToCloud: true
      };
      await setLocal(chromeLocal);
    }
  }
  if (lodashIsEmpty(chromeLocal.profiles)) {
    chromeLocal.profiles = [];
  }
  let isMutated = fixProfiles(chromeLocal.profiles);
  if (
    lodashIsUndefined(chromeLocal.selectedProfile) ||
    chromeLocal.selectedProfile < 0 ||
    chromeLocal.selectedProfile >= chromeLocal.profiles.length
  ) {
    chromeLocal.selectedProfile = chromeLocal.profiles.length - 1;
    isMutated = true;
  }
  if (isMutated) {
    await setLocal(chromeLocal);
  }
  return chromeLocal;
}
