import { writable, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashIsEqual from 'lodash/isEqual.js';
import lodashIsUndefined from 'lodash/isUndefined.js';
import { hideMessage } from './toast.js';
import { loadSignedInUser, signedInUser } from './identity.js';
import { changeStack, storage, storageWriter } from '@modheader/core';

export const profiles = writable([]);
export const selectedProfileIndex = writable(0);
export const isPaused = writable(false);
export const isInitialized = writable(false);

profiles.subscribe(($profiles) => {
  changeStack.setChangeField('profiles', $profiles);
});
selectedProfileIndex.subscribe(($selectedProfileIndex) => {
  changeStack.setChangeField('selectedProfileIndex', $selectedProfileIndex);
});
isPaused.subscribe(async ($isPaused) => {
  changeStack.setChangeField('isPaused', $isPaused);
  if (get(isInitialized)) {
    await storageWriter.setPaused($isPaused);
  }
});
isInitialized.subscribe(($isInitialized) => {
  if ($isInitialized) {
    changeStack.stopIgnoringChange();
  } else {
    changeStack.startIgnoringChange();
  }
});

export function undo() {
  let lastChange = changeStack.undoChange();
  if (!lastChange) {
    return;
  }
  const currentProfiles = get(profiles);
  const currentSelectedProfileIndex = get(selectedProfileIndex);
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
    if (!lodashIsUndefined(lastChange.isPaused) && lastChange.isPaused !== currentIsPaused) {
      break;
    }
    lastChange = changeStack.undoChange();
  }
  commitData({
    newProfiles: lastChange.profiles || currentProfiles,
    newIndex: lastChange.selectedProfileIndex,
    newIsPaused: lastChange.isPaused
  });
  hideMessage();
}

export function commitData({ newProfiles = [], newIndex = 0, newIsPaused } = {}) {
  changeStack.commit(() => {
    newIndex = Math.max(0, Math.min(newProfiles.length - 1, newIndex));
    if (lodashIsUndefined(newIsPaused)) {
      newIsPaused = get(isPaused);
    }
    profiles.set(newProfiles);
    selectedProfileIndex.set(newIndex);
    isPaused.set(newIsPaused);
    return {
      profiles: lodashCloneDeep(newProfiles),
      selectedProfileIndex: newIndex,
      isPaused: newIsPaused
    };
  });
}

export async function init() {
  isInitialized.set(false);
  const chromeLocal = await storage.getLocal(['profiles', 'selectedProfile', 'signedInUser', 'isPaused']);
  signedInUser.set(chromeLocal.signedInUser);
  loadSignedInUser();
  commitData({
    newProfiles: chromeLocal.profiles,
    newIndex: chromeLocal.selectedProfile,
    newIsPaused: !!chromeLocal.isPaused
  });
  isInitialized.set(true);
}
