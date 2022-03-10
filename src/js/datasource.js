import { writable, derived, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashDebounce from 'lodash/debounce';
import lodashIsEqual from 'lodash/isEqual';
import lodashOrderBy from 'lodash/orderBy';
import lodashIsUndefined from 'lodash/isUndefined';
import { showMessage, hideMessage } from './toast';
import { getLocal, setLocal, removeLocal } from './storage';
import { signedInUser } from './identity';
import { fixProfiles } from './profile';
import {
  undoChange,
  commit,
  setChangeField,
  stopIgnoringChange,
  startIgnoringChange
} from './change-stack';
import { takeRight } from './utils';
import { createHeader } from './header';
import { generateBackgroundColor, generateTextColor } from './color';

export const profiles = writable([]);
let latestProfiles = [];
export const selectedProfileIndex = writable(0);
let latestSelectedProfileIndex = 0;
export const selectedProfile = derived(
  [profiles, selectedProfileIndex],
  ([$profiles, $selectedProfileIndex]) => $profiles[$selectedProfileIndex] || {},
  {}
);
export const isPaused = writable(false);
export const isLocked = writable(false);
const debouncedSave = lodashDebounce(save, 500, { leading: true, trailing: true });

let isInitialized = false;

startIgnoringChange();
profiles.subscribe(($profiles) => {
  latestProfiles = $profiles;
  setChangeField('profiles', latestProfiles);
});
selectedProfileIndex.subscribe(($selectedProfileIndex) => {
  latestSelectedProfileIndex = $selectedProfileIndex;
  setChangeField('selectedProfileIndex', latestSelectedProfileIndex);
});
isPaused.subscribe(($isPaused) => {
  setChangeField('isPaused', $isPaused);
});
isLocked.subscribe(($isLocked) => {
  setChangeField('isLocked', $isLocked);
});
stopIgnoringChange();

function isExistingProfileTitle_(title) {
  for (const profile of latestProfiles) {
    if (profile.title === title) {
      return true;
    }
  }
  return false;
}

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

export function commitChange(change, index = -1) {
  if (index === -1) {
    index = latestSelectedProfileIndex;
  }
  const copy = lodashCloneDeep(latestProfiles[index]);
  Object.assign(copy, change);
  if (!lodashIsEqual(latestProfiles[index], copy)) {
    latestProfiles[index] = copy;
    setProfilesAndIndex(latestProfiles, index);
    debouncedSave();
  }
}

export function undo() {
  let lastChange = undoChange();
  if (!lastChange) {
    return;
  }
  const currentProfiles = latestProfiles;
  const currentSelectedProfileIndex = latestSelectedProfileIndex;
  const currentIsLocked = get(isLocked);
  const currentIsPaused = get(isPaused);
  while (lastChange) {
    if (
      !lodashIsUndefined(lastChange.profiles) &&
      !lodashIsEqual(lastChange.profiles, currentProfiles)
    ) {
      break;
    }
    if (
      !lodashIsUndefined(lastChange.selectedProfileIndex) &&
      lastChange.selectedProfileIndex !== currentSelectedProfileIndex
    ) {
      break;
    }
    if (!lodashIsUndefined(lastChange.isLocked) && lastChange.isLocked !== currentIsLocked) {
      break;
    }
    if (!lodashIsUndefined(lastChange.isPaused) && lastChange.isPaused !== currentIsPaused) {
      break;
    }
    lastChange = undoChange();
  }
  setProfilesAndIndex(
    lastChange.profiles || currentProfiles,
    lastChange.selectedProfileIndex || currentSelectedProfileIndex,
    { newIsLocked: lastChange.isLocked, newIsPaused: lastChange.isPaused }
  );
  debouncedSave();
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
    const { activeTabId } = await getLocal('activeTabId');
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

function setProfilesAndIndex(newProfiles, newIndex, { newIsLocked, newIsPaused } = {}) {
  commit(() => {
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
    return {
      profiles: lodashCloneDeep(newProfiles),
      selectedProfileIndex: newIndex,
      isLocked: newIsLocked,
      isPaused: newIsPaused
    };
  });
}

export function importProfiles(importProfiles) {
  fixProfiles(importProfiles);
  const innerProfiles = latestProfiles.concat(importProfiles);
  setProfilesAndIndex(innerProfiles, innerProfiles.length - 1);
  showMessage(`Imported profiles: ${importProfiles.map((p) => p.title).join(', ')}`, {
    canUndo: true
  });
}

export function addProfile() {
  const newProfile = createProfile();
  latestProfiles.push(newProfile);
  setProfilesAndIndex(latestProfiles, latestProfiles.length - 1);
}

export function selectProfile(profileIndex) {
  selectedProfileIndex.set(profileIndex);
}

export function removeProfile(profile) {
  latestProfiles.splice(latestProfiles.indexOf(profile), 1);
  if (latestProfiles.length === 0) {
    latestProfiles = [createProfile()];
  }
  setProfilesAndIndex(latestProfiles, latestProfiles.length - 1);
  showMessage('Profile deleted', { canUndo: true });
}

export function cloneProfile(profile) {
  const newProfile = lodashCloneDeep(profile);
  newProfile.title = 'Copy of ' + newProfile.title;
  latestProfiles.push(newProfile);
  setProfilesAndIndex(latestProfiles, latestProfiles.length - 1);
  showMessage('Profile cloned', { canUndo: true });
}

export function restoreToProfiles(profilesToRestore) {
  fixProfiles(profilesToRestore);
  setProfilesAndIndex(profilesToRestore, 0);
  showMessage('Profiles restored', { canUndo: true });
}

export function sortProfiles(sortOrder) {
  profiles.set(lodashOrderBy(latestProfiles, ['title'], [sortOrder]));
  if (sortOrder === 'asc') {
    showMessage('Profiles sorted in ascending order', { canUndo: true });
  } else {
    showMessage('Profiles sorted in descending order', { canUndo: true });
  }
}

export async function init() {
  const chromeLocal = await getLocal([
    'profiles',
    'selectedProfile',
    'signedInUser',
    'lockedTabId',
    'isPaused'
  ]);
  signedInUser.set(chromeLocal.signedInUser);
  setProfilesAndIndex(chromeLocal.profiles, chromeLocal.selectedProfile, {
    newIsLocked: !!chromeLocal.lockedTabId,
    newIsPaused: !!chromeLocal.isPaused
  });
  isInitialized = true;
}
