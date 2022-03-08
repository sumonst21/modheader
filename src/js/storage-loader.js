import { fixProfiles } from './profile';
import { getLocal, setLocal, getSync } from './storage';
import lodashIsUndefined from 'lodash/isUndefined';
import lodashIsEmpty from 'lodash/isEmpty';

export async function initStorage() {
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
