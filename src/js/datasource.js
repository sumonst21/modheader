import { writable, derived, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashIsEqual from 'lodash/isEqual';
import lodashOrderBy from 'lodash/orderBy';
import lodashLast from 'lodash/last';
import lodashIsUndefined from 'lodash/isUndefined';
import { showMessage, hideMessage } from './toast';
import { getLocal, setLocal, removeLocal } from './storage';
import { takeRight, generateBackgroundColor, generateTextColor } from './utils';

export const profiles = writable([]);
let latestProfiles = [];
export const selectedProfileIndex = writable(0);
let latestSelectedProfileIndex = 0;
export const selectedProfile = derived(
  [
    profiles,
    selectedProfileIndex
  ],
  ([$profiles, $selectedProfileIndex]) => $profiles[$selectedProfileIndex],
  {},
);
export const isPaused = writable(false);
export const isLocked = writable(false);

export const changesStack = writable([]);
let ignoringChangeStack = true;
let isInitialized = false;
profiles.subscribe($profiles => {
  latestProfiles = $profiles;
  if (!ignoringChangeStack) {
    const changes = get(changesStack);
    const profilesCopy = lodashCloneDeep($profiles);
    if (changes.length === 0 || !lodashIsEqual(lodashLast(changes).profiles, profilesCopy)) {
      changes.push({profiles: profilesCopy});
      changesStack.set(changes);
    }
  }
});
selectedProfileIndex.subscribe($selectedProfileIndex => {
  latestSelectedProfileIndex = $selectedProfileIndex;
  if (!ignoringChangeStack) {
    const changes = get(changesStack);
    if (changes.length === 0 || lodashLast(changes).selectedProfileIndex !== $selectedProfileIndex) {
      changes.push({selectedProfileIndex: $selectedProfileIndex});
      changesStack.set(changes);
    }
  }
});
isPaused.subscribe($isPaused => {
  if (!ignoringChangeStack) {
    const changes = get(changesStack);
    if (changes.length === 0 || lodashLast(changes).isPaused !== $isPaused) {
      changes.push({isPaused: $isPaused});
      changesStack.set(changes);
    }
  }
});
isLocked.subscribe($isLocked => {
  if (!ignoringChangeStack) {
    const changes = get(changesStack);
    if (changes.length === 0 || lodashLast(changes).isLocked !== $isLocked) {
      changes.push({isLocked: $isLocked});
      changesStack.set(changes);
    }
  }
});
ignoringChangeStack = false;


function isExistingProfileTitle_(title) {
  const innerProfiles = get(profiles);
  for (let i = 0; i < innerProfiles.length; ++i) {
    if (innerProfiles[i].title == title) {
      return true;
    }
  }
  return false;
}

export function save() {
  const background = chrome.extension.getBackgroundPage();
  if (background) {
    background.saveToStorage({
      profiles: latestProfiles,
      selectedProfile: latestSelectedProfileIndex
    });
  } else {
    // Firefox's private session cannot access background page, so just set
    // directly to the browser storage.
    browser.storage.local.set({
      profiles: latestProfiles,
      selectedProfile: latestSelectedProfileIndex
    });
  }
}

export async function addFilter() {
  let urlRegex = '';
  const { currentTabUrl } = await getLocal('currentTabUrl');
  if (currentTabUrl) {
    const parser = document.createElement('a');
    parser.href = currentTabUrl;
    urlRegex = parser.origin + '/.*';
  }
  const filters = get(selectedProfile).filters;
  filters.push({
    enabled: true,
    type: 'urls',
    urlRegex: urlRegex,
    resourceType: []
  });
  commitChange({ filters });
}

export function addHeader(headers) {
  headers.push({
    enabled: true,
    name: '',
    value: '',
    comment: ''
  });
}

export async function addUrlReplacement(replacements) {
  let domain = '';
  const { currentTabUrl } = await getLocal('currentTabUrl');
  if (currentTabUrl) {
    domain = new URL(currentTabUrl).origin;
  }
  replacements.push({
    enabled: true,
    name: domain,
    value: domain,
    comment: ''
  });
}

export function removeFilter(filter) {
  const filters = get(selectedProfile).filters;
  filters.splice(filters.indexOf(filter), 1);
  commitChange({ filters });
}

export function removeHeader(headers, header) {
  headers.splice(headers.indexOf(header), 1);
}

export function removeUrlReplacement(urlReplacements, replacement) {
  urlReplacements.splice(urlReplacements.indexOf(replacement), 1);
}

export function commitChange(change) {
  const copy = lodashCloneDeep(latestProfiles[latestSelectedProfileIndex]);
  Object.assign(copy, change);
  if (!lodashIsEqual(latestProfiles[latestSelectedProfileIndex], copy)) {
    latestProfiles[latestSelectedProfileIndex] = copy;
    setProfilesAndIndex(latestProfiles, latestSelectedProfileIndex);
  }
}

export function undo() {
  const changes = get(changesStack);
  if (changes.length === 0) {
    return;
  }
  let lastChange;
  const currentProfiles = get(profiles);
  const currentSelectedProfileIndex = get(selectedProfileIndex);
  const currentIsLocked = get(isLocked);
  const currentIsPaused = get(isPaused);
  while (changes.length > 0) {
    lastChange = changes.pop();
    if (!lodashIsUndefined(lastChange.profiles) &&
        !lodashIsEqual(lastChange.profiles, currentProfiles)) {
      break;
    }
    if (!lodashIsUndefined(lastChange.selectedProfileIndex) &&
        lastChange.selectedProfileIndex !== currentSelectedProfileIndex) {
      break;
    }
    if (!lodashIsUndefined(lastChange.isLocked) &&
        lastChange.isLocked !== currentIsLocked) {
      break;
    }
    if (!lodashIsUndefined(lastChange.isPaused) &&
        lastChange.isPaused !== currentIsPaused) {
      break;
    }
  }
  changesStack.set(changes);
  setProfilesAndIndex(
      lastChange.profiles || currentProfiles,
      lastChange.selectedProfileIndex || currentSelectedProfileIndex,
      { newIsLocked: lastChange.isLocked, newIsPaused: lastChange.isPaused });
  hideMessage();
}

export async function pause() {
  isPaused.set(true);
  await setLocal({ isPaused: true });
}

export async function play() {
  isPaused.set(false);
  await removeLocal('isPaused');
}

export async function lockToTab() {
  isLocked.set(true);
  if (isInitialized) {
    const activeTabId = await getLocal('activeTabId');
    await setLocal({ lockedTabId: activeTabId });
  }
}

export async function unlockAllTab() {
  isLocked.set(false);
  await removeLocal('lockedTabId');
}

export function createProfile() {
  let index = 1;
  while (isExistingProfileTitle_('Profile ' + index)) {
    ++index;
  }
  const profile = {
    title: 'Profile ' + index,
    hideComment: true,
    headers: [],
    respHeaders: [],
    filters: [],
    urlReplacements: [],
    appendMode: false,
    backgroundColor: generateBackgroundColor(),
    textColor: generateTextColor(),
    shortTitle: takeRight(index),
  };
  addHeader(profile.headers);
  return profile;
};

function setProfilesAndIndex(newProfiles, newIndex, { newIsLocked, newIsPaused } = {}) {
  ignoringChangeStack = true;
  newIndex = Math.max(0, Math.min(newProfiles.length - 1, newIndex));
  if (lodashIsUndefined(newIsLocked)) {
    newIsLocked = get(isLocked);
  }
  if (lodashIsUndefined(newIsPaused)) {
    newIsPaused = get(isPaused);
  }
  profiles.set(newProfiles);
  selectedProfileIndex.set(newIndex);
  if (newIsLocked) {
    lockToTab();
  } else {
    unlockAllTab();
  }
  if (newIsPaused) {
    pause();
  } else {
    play();
  }
  const changes = get(changesStack);
  changes.push({
    profiles: lodashCloneDeep(newProfiles),
    selectedProfileIndex: newIndex,
    isLocked: newIsLocked,
    isPaused: newIsPaused,
  });

  changesStack.set(changes);
  ignoringChangeStack = false;
}

export function importProfiles(importProfiles) {
  for (const p of importProfiles) {
    fixProfile(p);
  }
  const innerProfiles = get(profiles).concat(importProfiles);
  setProfilesAndIndex(innerProfiles, innerProfiles.length - 1);
  showMessage(`Imported profiles: ${importProfiles.map(p => p.title).join(", ")}`, { canUndo: true });
}

export function addProfile() {
  const newProfile = createProfile();
  const innerProfiles = get(profiles);
  innerProfiles.push(newProfile);
  setProfilesAndIndex(innerProfiles, innerProfiles.length - 1);
}

export function selectProfile(profileIndex) {
  selectedProfileIndex.set(profileIndex);
}

export function removeProfile(profile) {
  let innerProfiles = get(profiles);
  innerProfiles.splice(innerProfiles.indexOf(profile), 1);
  if (innerProfiles.length == 0) {
    innerProfiles = [createProfile()];
  }
  setProfilesAndIndex(innerProfiles, innerProfiles.length - 1);
  showMessage('Profile deleted', { canUndo: true });
}

export function cloneProfile(profile) {
  const newProfile = lodashCloneDeep(profile);
  newProfile.title = 'Copy of ' + newProfile.title;
  const innerProfiles = get(profiles);
  innerProfiles.push(newProfile);
  setProfilesAndIndex(innerProfiles, innerProfiles.length - 1);
  showMessage('Profile cloned', { canUndo: true });
}

function fixProfile(profile) {
  if (profile.filters) {
    for (let filter of profile.filters) {
      if (filter.urlPattern) {
        const urlPattern = filter.urlPattern;
        const joiner = [];
        for (let i = 0; i < urlPattern.length; ++i) {
          let c = urlPattern.charAt(i);
          if (SPECIAL_CHARS.indexOf(c) >= 0) {
            c = '\\' + c;
          } else if (c == '\\') {
            c = '\\\\';
          } else if (c == '*') {
            c = '.*';
          }
          joiner.push(c);
        }
        delete filter.urlPattern;
        filter.urlRegex = joiner.join('');
      }
      if (!filter.resourceType) {
        filter.resourceType = [];
      }
    }
  }
  if (!profile.backgroundColor) {
    profile.backgroundColor = generateBackgroundColor();
  }
  if (!!profile.textColor) {
    profile.textColor = generateTextColor();
  }
}

export function restoreToProfiles(profilesToRestore) {
  for (const profile of profilesToRestore) {
    fixProfile(profile);
  }
  setProfilesAndIndex(profilesToRestore, 0);
  showMessage('Profiles restored', { canUndo: true });
}

export function sortProfiles(sortOrder) {
  profiles.set(lodashOrderBy(get(profiles), ['title'], [sortOrder]));
  if (sortOrder === 'asc') {
    showMessage('Profiles sorted in ascending order', { canUndo: true });
  } else {
    showMessage('Profiles sorted in descending order', { canUndo: true });
  }
}

export async function init() {
  const chromeLocal = await getLocal([
    'profiles', 'selectedProfile', 'lockedTabId', 'isPaused']);
  let innerProfiles = [];
  if (chromeLocal.profiles) {
    innerProfiles = chromeLocal.profiles;
    for (let profile of innerProfiles) {
      fixProfile(profile);
    }
  }
  if (innerProfiles.length == 0) {
    innerProfiles.push(createProfile());
  }
  for (let index in innerProfiles) {
    const profile = innerProfiles[index];
    if (!profile.title) {
      profile.title = 'Profile ' + (index + 1);
    }
    if (!profile.shortTitle) {
      profile.shortTitle = takeRight(index + 1);
    }
    if (!profile.headers) {
      profile.headers = [];
      addHeader(profile.headers);
    }
    if (!profile.respHeaders) {
      profile.respHeaders = [];
    }
    if (!profile.urlReplacements) {
      profile.urlReplacements = [];
    }
    if (!profile.filters) {
      profile.filters = [];
    }
  }
  let profileIndex = 0;
  if (chromeLocal.selectedProfile) {
    profileIndex = Number(chromeLocal.selectedProfile);
  }
  if (!(profileIndex >= 0 && profileIndex < innerProfiles.length)) {
    profileIndex = innerProfiles.length - 1;
  }
  setProfilesAndIndex(innerProfiles, profileIndex,
    { newIsLocked: !!chromeLocal.lockedTabId,
      newIsPaused: !!chromeLocal.isPaused });
  isInitialized = true;
}
