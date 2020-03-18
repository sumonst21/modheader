import { writable, derived, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashOrderBy from 'lodash/orderBy';
import lodashLast from 'lodash/last';
import lodashIsUndefined from 'lodash/isUndefined';
import { showMessage, hideMessage } from './toast';

export const profiles = writable([]);
export const selectedProfileIndex = writable(0);
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
profiles.subscribe($profiles => {
  if (!ignoringChangeStack) {
    const changes = get(changesStack);
    const serializedProfiles = JSON.stringify($profiles);
    if (changes.length === 0 || lodashLast(changes).profiles !== serializedProfiles) {
      changes.push({profiles: serializedProfiles});
      changesStack.set(changes);
    }
  }
});
selectedProfileIndex.subscribe($selectedProfileIndex => {
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

function hslToRgb(h, s, l){
  let r, g, b;
  if (s == 0){
      r = g = b = l; // achromatic
  } else {
      function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }
  function toHex(v) {
    return Math.round(v * 255).toString(16).padStart(2, '0');
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateColor() {
  const hue = Math.random();
  const saturation =  Math.random();
  const lightness =  Math.random() * .4;
  const rgb = hslToRgb(hue, saturation, lightness);
  return  rgb;
}

function takeRight(v) {
  const s = v.toString();
  return s[s.length - 1];
}

export function addFilter() {
  let urlRegex = '';
  if (localStorage.currentTabUrl) {
    const parser = document.createElement('a');
    parser.href = localStorage.currentTabUrl;
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

export function addUrlReplacement(replacements) {
  let domain = '';
  if (localStorage.currentTabUrl) {
    domain = new URL(localStorage.currentTabUrl).origin;
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
  const innerProfiles = get(profiles);
  const index = get(selectedProfileIndex);
  innerProfiles[index] = Object.assign(innerProfiles[index], change);
  setProfilesAndIndex(innerProfiles, index);
}

export function undo() {
  const changes = get(changesStack);
  if (changes.length === 0) {
    return;
  }
  let lastChange;
  const currentProfiles = get(profiles);
  const serializedCurrentProfiles = JSON.stringify(currentProfiles);
  let currentSelectedProfileIndex = get(selectedProfileIndex);
  let currentIsLocked = get(isLocked);
  let currentIsPaused = get(isPaused);
  while (changes.length > 0) {
    lastChange = changes.pop();
    if (!lodashIsUndefined(lastChange.profiles) &&
        lastChange.profiles !== serializedCurrentProfiles) {
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
      (lastChange.profiles && JSON.parse(lastChange.profiles)) || currentProfiles,
      lastChange.selectedProfileIndex || currentSelectedProfileIndex,
      { newIsLocked: lastChange.isLocked, newIsPaused: lastChange.isPaused });
  hideMessage();
}

export function pause() {
  isPaused.set(true);
  localStorage.isPaused = true;
}

export function play() {
  isPaused.set(false);
  localStorage.removeItem('isPaused');
}

export function lockToTab() {
  isLocked.set(true);
  localStorage.lockedTabId = localStorage.activeTabId;
}

export function unlockAllTab() {
  isLocked.set(false);
  localStorage.removeItem('lockedTabId');
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
    color: generateColor(),
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
    profiles: JSON.stringify(newProfiles),
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
  if (!profile.color) {
    profile.color = generateColor();
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

export function save() {
  localStorage.profiles = JSON.stringify(get(profiles));
  localStorage.selectedProfile = get(selectedProfileIndex);
}

function init() {
  let innerProfiles = [];
  if (localStorage.profiles) {
    innerProfiles = JSON.parse(localStorage.profiles);
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
      addHeader(profile.respHeaders);
    }
    if (!profile.urlReplacements) {
      profile.urlReplacements = [];
      addUrlReplacement(profile.urlReplacements);
    }
    if (!profile.filters) {
      profile.filters = [];
    }
  }
  let profileIndex = 0;
  if (localStorage.selectedProfile) {
    profileIndex = Number(localStorage.selectedProfile);
  }
  if (!(profileIndex > 0 && profileIndex < innerProfiles.length)) {
    profileIndex = innerProfiles.length - 1;
  }
  setProfilesAndIndex(innerProfiles, profileIndex,
    { newIsLocked: !!localStorage.lockedTabId, newIsPaused: localStorage.isPaused });
}

init();
