import { takeRight } from './utils';
import { createHeader } from './header';
import { generateBackgroundColor, generateTextColor } from './color';
import { profiles, commitData, selectedProfileIndex } from './datasource';
import { showMessage } from './toast';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashOrderBy from 'lodash/orderBy';
import lodashIsEqual from 'lodash/isEqual';
import lodashIsArray from 'lodash/isArray';

let latestProfiles = [];
let latestSelectedProfileIndex = 0;
profiles.subscribe(($profiles) => {
  latestProfiles = $profiles;
});
selectedProfileIndex.subscribe(($selectedProfileIndex) => {
  latestSelectedProfileIndex = $selectedProfileIndex;
});

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
