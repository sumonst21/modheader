import { get, derived } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashOrderBy from 'lodash/orderBy.js';
import lodashIsEqual from 'lodash/isEqual.js';
import lodashIsArray from 'lodash/isArray.js';
import lodashDebounce from 'lodash/debounce.js';
import { takeRight } from './utils.js';
import { createHeader } from './header.js';
import { lightOrDark, generateBackgroundColor, generateTextColor } from './color.js';
import { profiles, commitData, selectedProfileIndex, isInitialized } from './datasource.js';
import { showMessage } from './toast.js';

let latestProfiles = [];
let latestSelectedProfileIndex = 0;
profiles.subscribe(($profiles) => {
  latestProfiles = $profiles;
  if (get(isInitialized)) {
    debouncedSave();
  }
});
selectedProfileIndex.subscribe(($selectedProfileIndex) => {
  latestSelectedProfileIndex = $selectedProfileIndex;
  if (get(isInitialized)) {
    debouncedSave();
  }
});
export const selectedProfile = derived(
  [profiles, selectedProfileIndex],
  ([$profiles, $selectedProfileIndex]) => $profiles[$selectedProfileIndex] || {},
  {}
);
export const buttonColor = derived(
  [selectedProfile],
  ([$selectedProfile]) =>
    lightOrDark($selectedProfile.backgroundColor) === 'light' ? 'black' : 'white',
  'white'
);

const debouncedSave = lodashDebounce(save, 500, { leading: true, trailing: true });

export async function save() {
  try {
    const background = chrome.extension.getBackgroundPage();
    await background.saveToStorage({
      profiles: latestProfiles,
      selectedProfile: latestSelectedProfileIndex
    });
  } catch (err) {
    // Firefox's private session cannot access background page, so just set
    // directly to the browser storage.
    await browser.storage.local.set({
      profiles: latestProfiles,
      selectedProfile: latestSelectedProfileIndex
    });
  }
}

function isExistingProfileTitle_(title) {
  for (const profile of latestProfiles) {
    if (profile.title === title) {
      return true;
    }
  }
  return false;
}

export function fixProfiles(profiles) {
  let isMutated = false;
  if (profiles.length === 0) {
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
      shortTitle: '1'
    });
    isMutated = true;
  }
  for (let index = 0; index < profiles.length; ++index) {
    const profile = profiles[index];
    if (profile.appendMode === undefined) {
      profile.appendMode = false;
    }
    if (profile.hideComment === undefined) {
      profile.hideComment = true;
    }
    if (!profile.title) {
      profile.title = 'Profile ' + (index + 1);
      isMutated = true;
    }
    if (!profile.shortTitle) {
      profile.shortTitle = takeRight(index + 1);
      isMutated = true;
    }
    if (!profile.headers || !lodashIsArray(profile.headers)) {
      profile.headers = [createHeader()];
      isMutated = true;
    }
    if (!profile.respHeaders || !lodashIsArray(profile.respHeaders)) {
      profile.respHeaders = [];
      isMutated = true;
    }
    if (!profile.urlReplacements || !lodashIsArray(profile.urlReplacements)) {
      profile.urlReplacements = [];
      isMutated = true;
    }
    if (!profile.filters || !lodashIsArray(profile.filters)) {
      profile.filters = [];
      isMutated = true;
    }
    for (let filter of profile.filters) {
      if (!filter.resourceType) {
        filter.resourceType = [];
        isMutated = true;
      }
      if (!filter.comment) {
        filter.comment = '';
        isMutated = true;
      }
    }
    if (!profile.backgroundColor) {
      profile.backgroundColor = generateBackgroundColor();
      isMutated = true;
    }
    if (!profile.textColor) {
      profile.textColor = generateTextColor();
      isMutated = true;
    }
  }
  return isMutated;
}

function createProfile() {
  let index = 1;
  while (isExistingProfileTitle_('Profile ' + index)) {
    ++index;
  }
  const profile = {
    title: 'Profile ' + index,
    hideComment: true,
    headers: [createHeader()],
    respHeaders: [],
    filters: [],
    urlReplacements: [],
    appendMode: false,
    backgroundColor: generateBackgroundColor(),
    textColor: generateTextColor(),
    shortTitle: takeRight(index)
  };
  return profile;
}

export function updateProfile(change, index = -1) {
  if (index === -1) {
    index = latestSelectedProfileIndex;
  }
  const copy = lodashCloneDeep(latestProfiles[index]);
  Object.assign(copy, change);
  if (!lodashIsEqual(latestProfiles[index], copy)) {
    latestProfiles[index] = copy;
    commitData({ newProfiles: latestProfiles, newIndex: index });
  }
}

export function addProfile() {
  const newProfile = createProfile();
  latestProfiles.push(newProfile);
  commitData({ newProfiles: latestProfiles, newIndex: latestProfiles.length - 1 });
}

export function removeProfile(profileIndex) {
  latestProfiles.splice(profileIndex, 1);
  if (latestProfiles.length === 0) {
    latestProfiles = [createProfile()];
  }
  commitData({ newProfiles: latestProfiles, newIndex: latestProfiles.length - 1 });
  showMessage('Profile deleted', { canUndo: true });
}

export function cloneProfile(profile) {
  const newProfile = lodashCloneDeep(profile);
  newProfile.title = 'Copy of ' + newProfile.title;
  latestProfiles.push(newProfile);
  commitData({ newProfiles: latestProfiles, newIndex: latestProfiles.length - 1 });
  showMessage('Profile cloned', { canUndo: true });
}

export function sortProfiles(sortOrder) {
  profiles.set(lodashOrderBy(latestProfiles, ['title'], [sortOrder]));
  if (sortOrder === 'asc') {
    showMessage('Profiles sorted in ascending order', { canUndo: true });
  } else {
    showMessage('Profiles sorted in descending order', { canUndo: true });
  }
}

export function importProfiles(importProfiles) {
  fixProfiles(importProfiles);
  const innerProfiles = latestProfiles.concat(importProfiles);
  commitData({ newProfiles: innerProfiles, newIndex: innerProfiles.length - 1 });
  showMessage(`Imported profiles: ${importProfiles.map((p) => p.title).join(', ')}`, {
    canUndo: true
  });
}

export function restoreToProfiles(profilesToRestore) {
  fixProfiles(profilesToRestore);
  commitData({ newProfiles: profilesToRestore, newIndex: 0 });
  showMessage('Profiles restored', { canUndo: true });
}

export function selectProfile(profileIndex) {
  selectedProfileIndex.set(profileIndex);
}
