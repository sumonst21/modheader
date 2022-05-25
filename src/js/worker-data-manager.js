import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashIsUndefined from 'lodash/isUndefined.js';
import lodashIsEqual from 'lodash/isEqual.js';
import { storage, storageWriter } from '@modheader/core';
import { filterEnabled } from './utils.js';
import { fixProfiles } from './profile.js';
import { optimizeResourceFilters, optimizeTabFilters, optimizeUrlFilters } from './filter.js';
import { optimizeUrlRedirects } from './url-redirect.js';
import { initStorage } from './storage-loader.js';

const MAX_PROFILES_IN_CLOUD = 20;

export async function loadProfilesFromStorage(dataChangeCallback) {
  let chromeLocal = await initStorage();
  let reloadResponse = reloadActiveProfiles(chromeLocal);
  await dataChangeCallback(reloadResponse);

  storage.addStorageChangeListener(async (changes) => {
    const profilesUpdated = !lodashIsUndefined(changes.profiles);
    if (profilesUpdated) {
      // Profiles need to be upgraded. Convert and resave to localStorage. The change will trigger the storage change
      // listener to get invoked again.
      let newProfiles = changes.profiles.newValue;
      if (lodashIsUndefined(newProfiles)) {
        newProfiles = [];
      }
      if (fixProfiles(newProfiles)) {
        await storageWriter.setProfiles(newProfiles);
        return;
      }
    }
    for (const [key, value] of Object.entries(changes)) {
      chromeLocal[key] = value.newValue;
    }
    if (profilesUpdated || changes.selectedProfile) {
      reloadResponse = reloadActiveProfiles(chromeLocal);
    }
    await dataChangeCallback(reloadResponse);
    if (profilesUpdated) {
      await saveStorageToCloud(chromeLocal);
    }
  });
}

function reloadActiveProfiles(chromeLocal) {
  const activeProfiles = [];
  let selectedActiveProfile = undefined;
  if (chromeLocal.profiles) {
    const profiles = chromeLocal.profiles;
    for (const [i, value] of profiles.entries()) {
      if (i !== chromeLocal.selectedProfile && !value.alwaysOn) {
        continue;
      }
      const profile = lodashCloneDeep(value);
      profile.headers = filterEnabled(profile.headers);
      profile.respHeaders = filterEnabled(profile.respHeaders);
      profile.cookieHeaders = filterEnabled(profile.cookieHeaders);
      profile.setCookieHeaders = filterEnabled(profile.setCookieHeaders);
      profile.urlReplacements = optimizeUrlRedirects(profile.urlReplacements);
      profile.urlFilters = optimizeUrlFilters(profile.urlFilters);
      profile.excludeUrlFilters = optimizeUrlFilters(profile.excludeUrlFilters);
      profile.resourceFilters = optimizeResourceFilters(profile.resourceFilters);
      profile.tabFilters = optimizeTabFilters(profile.tabFilters);
      profile.tabGroupFilters = optimizeTabFilters(profile.tabGroupFilters);
      profile.windowFilters = optimizeTabFilters(profile.windowFilters);
      if (i === chromeLocal.selectedProfile) {
        selectedActiveProfile = profile;
      }
      activeProfiles.push(profile);
    }
  }
  return { chromeLocal, activeProfiles, selectedActiveProfile };
}

async function saveStorageToCloud(chromeLocal) {
  const items = await storage.getSync();
  const keys = items ? Object.keys(items) : [];
  keys.sort();
  if (keys.length >= MAX_PROFILES_IN_CLOUD) {
    await storage.removeSync(keys.slice(0, keys.length - MAX_PROFILES_IN_CLOUD));
  }
  if (keys.length === 0 || !lodashIsEqual(items[keys[keys.length - 1]], chromeLocal.profiles)) {
    const data = {};
    data[Date.now()] = chromeLocal.profiles;
    await storage.setSync(data);
  }
}
