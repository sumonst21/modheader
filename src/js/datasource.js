import { writable, derived, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashDebounce from 'lodash/debounce';
import lodashIsEqual from 'lodash/isEqual';
import lodashIsUndefined from 'lodash/isUndefined';
import { hideMessage } from './toast';
import { getLocal, setLocal, removeLocal } from './storage';
import { signedInUser } from './identity';
import {
  undoChange,
  commit,
  setChangeField,
  stopIgnoringChange,
  startIgnoringChange
} from './change-stack';

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

profiles.subscribe(($profiles) => {
  latestProfiles = $profiles;
  setChangeField('profiles', latestProfiles);
});
selectedProfileIndex.subscribe(($selectedProfileIndex) => {
  latestSelectedProfileIndex = $selectedProfileIndex;
  setChangeField('selectedProfileIndex', latestSelectedProfileIndex);
});
isPaused.subscribe(async ($isPaused) => {
  setChangeField('isPaused', $isPaused);
  if (isInitialized) {
    if ($isPaused) {
      await setLocal({ isPaused: true });
    } else {
      await removeLocal('isPaused');
    }
  }
});
isLocked.subscribe(async ($isLocked) => {
  setChangeField('isLocked', $isLocked);
  if (isInitialized) {
    if ($isLocked) {
      const { activeTabId } = await getLocal('activeTabId');
      await setLocal({ lockedTabId: activeTabId });
    } else {
      await removeLocal('lockedTabId');
    }
  }
});

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
  commitData({
    newProfiles: lastChange.profiles || currentProfiles,
    newIndex: lastChange.selectedProfileIndex || currentSelectedProfileIndex,
    newIsLocked: lastChange.isLocked,
    newIsPaused: lastChange.isPaused
  });
  hideMessage();
}

export function commitData({ newProfiles, newIndex, newIsLocked, newIsPaused } = {}) {
  commit(() => {
    newIndex = Math.max(0, Math.min(newProfiles.length - 1, newIndex));
    if (!lodashIsUndefined(newIsLocked)) {
      newIsLocked = get(isLocked);
    }
    if (lodashIsUndefined(newIsPaused)) {
      newIsPaused = get(isPaused);
    }
    profiles.set(newProfiles);
    selectedProfileIndex.set(newIndex);
    isLocked.set(newIsLocked);
    isPaused.set(newIsPaused);
    return {
      profiles: lodashCloneDeep(newProfiles),
      selectedProfileIndex: newIndex,
      isLocked: newIsLocked,
      isPaused: newIsPaused
    };
  });
  debouncedSave();
}

export function selectProfile(profileIndex) {
  selectedProfileIndex.set(profileIndex);
}

export async function init() {
  startIgnoringChange();
  const chromeLocal = await getLocal([
    'profiles',
    'selectedProfile',
    'signedInUser',
    'lockedTabId',
    'isPaused'
  ]);
  signedInUser.set(chromeLocal.signedInUser);
  commitData({
    newProfiles: chromeLocal.profiles,
    newIndex: chromeLocal.selectedProfile,
    newIsLocked: !!chromeLocal.lockedTabId,
    newIsPaused: !!chromeLocal.isPaused
  });
  isInitialized = true;
  stopIgnoringChange();
}
