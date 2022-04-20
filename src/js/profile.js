import { get, derived } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashOrderBy from 'lodash/orderBy.js';
import lodashIsEqual from 'lodash/isEqual.js';
import lodashIsArray from 'lodash/isArray.js';
import lodashDebounce from 'lodash/debounce.js';
import { takeRight } from './utils.js';
import { createHeader } from './header.js';
import { FilterType } from './filter.js';
import { lightOrDark, generateBackgroundColor, generateTextColor } from './color.js';
import { profiles, commitData, selectedProfileIndex, isInitialized } from './datasource.js';
import { showMessage } from './toast.js';
import lodashClone from 'lodash/clone.js';
import { AppendMode } from './append-mode.js';

export const PROFILE_VERSION = 2;
const ARRAY_FIELDS = [
  'headers',
  'respHeaders',
  'urlReplacements',
  'cookieHeaders',
  'setCookieHeaders',
  'urlFilters',
  'excludeUrlFilters',
  'resourceFilters',
  'tabFilters'
];
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
    profiles.push(createProfile());
    isMutated = true;
  }
  for (let index = 0; index < profiles.length; ++index) {
    const profile = profiles[index];
    if (!profile.version) {
      upgradeFromProfileVersion1({ profile, index });
      isMutated = true;
    }
  }
  for (const profile of profiles) {
    if (profile.hideComment === undefined) {
      profile.hideComment = true;
      isMutated = true;
    }
    if (!profile.backgroundColor) {
      profile.backgroundColor = generateBackgroundColor();
      isMutated = true;
    }
    if (!profile.textColor) {
      profile.textColor = generateTextColor();
      isMutated = true;
    }
    if (!profile.shortTitle) {
      profile.shortTitle = takeRight(profile.title);
      isMutated = true;
    }
    for (const arrayField of ARRAY_FIELDS) {
      if (!profile[arrayField]) {
        profile[arrayField] = [];
        isMutated = true;
      } else {
        for (const entry of profile[arrayField]) {
          if (entry.comment === undefined) {
            entry.comment = '';
            isMutated = true;
          }
        }
      }
    }
  }
  return isMutated;
}

function upgradeFromProfileVersion1({ profile, index }) {
  profile.version = PROFILE_VERSION;
  if (profile.hideComment === undefined) {
    profile.hideComment = true;
  }
  if (!profile.title) {
    profile.title = 'Profile ' + (index + 1);
  }
  if (!profile.shortTitle) {
    profile.shortTitle = takeRight(index + 1);
  }
  if (!profile.headers || !lodashIsArray(profile.headers)) {
    profile.headers = [createHeader()];
  }
  if (!profile.respHeaders || !lodashIsArray(profile.respHeaders)) {
    profile.respHeaders = [];
  }
  if (!profile.cookieHeaders || !lodashIsArray(profile.cookieHeaders)) {
    profile.cookieHeaders = [];
  }
  if (!profile.setCookieHeaders || !lodashIsArray(profile.setCookieHeaders)) {
    profile.setCookieHeaders = [];
  }
  if (!profile.urlReplacements || !lodashIsArray(profile.urlReplacements)) {
    profile.urlReplacements = [];
  }
  let appendMode = AppendMode.OVERRIDE;
  if (profile.appendMode === 'comma') {
    appendMode = AppendMode.COMMA_SEPARATED_APPEND;
  } else if (profile.appendMode === 'true' || profile.appendMode === true) {
    appendMode = AppendMode.APPEND;
  }
  delete profile.appendMode;
  const allHeaders = [...profile.headers, ...profile.respHeaders];
  for (const modifier of allHeaders) {
    modifier.appendMode = appendMode;
  }
  if (profile.sendEmptyHeader) {
    for (const modifier of allHeaders) {
      modifier.sendEmptyHeader = true;
    }
  }
  delete profile.sendEmptyHeader;
  profile.urlFilters = [];
  profile.excludeUrlFilters = [];
  profile.resourceFilters = [];
  profile.tabFilters = [];
  for (const filter of profile.filters || []) {
    const type = filter.type;
    delete filter.type;
    if (!filter.comment) {
      filter.comment = '';
    }
    switch (type) {
      case FilterType.URLS:
        profile.urlFilters.push(filter);
        break;
      case FilterType.EXCLUDE_URLS:
        profile.excludeUrlFilters.push(filter);
        break;
      case FilterType.RESOURCE_TYPES:
        if (!filter.resourceType) {
          filter.resourceType = [];
        }
        profile.resourceFilters.push(filter);
        break;
    }
  }
  delete profile.filters;

  if (!profile.backgroundColor) {
    profile.backgroundColor = generateBackgroundColor();
  }
  if (!profile.textColor) {
    profile.textColor = generateTextColor();
  }
}

export function createProfile() {
  let index = 1;
  while (isExistingProfileTitle_('Profile ' + index)) {
    ++index;
  }
  const profile = {
    version: PROFILE_VERSION,
    title: 'Profile ' + index,
    hideComment: true,
    headers: [createHeader()],
    respHeaders: [],
    urlReplacements: [],
    cookieHeaders: [],
    setCookieHeaders: [],
    urlFilters: [],
    excludeUrlFilters: [],
    resourceFilters: [],
    tabFilters: [],
    backgroundColor: generateBackgroundColor(),
    textColor: generateTextColor(),
    shortTitle: takeRight(index)
  };
  return profile;
}

export function updateProfile(change) {
  const index = latestSelectedProfileIndex;
  const latestProfile = latestProfiles[index];
  // Detect if there is indeed a change. If the change is identical, then no need to reapply the change.
  let hasChanged = false;
  for (const [key, value] of Object.entries(change)) {
    if (!lodashIsEqual(latestProfile[key], value)) {
      hasChanged = true;
      break;
    }
  }
  if (hasChanged) {
    // Only deep clone the changes to minimize performance impact.
    const copy = lodashClone(latestProfile);
    for (const [key, value] of Object.entries(change)) {
      copy[key] = lodashCloneDeep(value);
    }
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

export function exportProfile(profile, { keepStyles } = {}) {
  const cloneProfile = lodashCloneDeep(profile);
  if (profile.hideComment) {
    delete profile.hideComment;
  }
  if (!keepStyles) {
    delete profile.backgroundColor;
    delete profile.textColor;
  }
  for (const arrayField of ARRAY_FIELDS) {
    if (!profile[arrayField] || profile[arrayField].length === 0) {
      delete profile[arrayField];
    } else {
      for (const entry of profile[arrayField]) {
        if (!entry.comment) {
          delete entry.comment;
        }
      }
    }
    const autocompleteField = `${arrayField}Autocomplete`;
    if (
      profile[autocompleteField] &&
      profile[autocompleteField].autocompleteName.length === 0 &&
      profile[autocompleteField].autocompleteValue.length === 0
    ) {
      delete profile[autocompleteField];
    }
  }
  return cloneProfile;
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
