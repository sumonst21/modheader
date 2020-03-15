import { writable, derived, get } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashOrderBy from 'lodash/orderBy';

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

export let isPaused = writable(false);
export let isLocked = writable(false);

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
  profiles.set(innerProfiles);
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

export function importProfiles(importProfiles) {
  for (const p of importProfiles) {
    fixProfile(p);
  }
  const innerProfiles = get(profiles).concat(importProfiles);
  profiles.set(innerProfiles);
  selectedProfileIndex.set(innerProfiles.length - 1);
}

export function addProfile() {
  const newProfile = createProfile();
  const innerProfiles = get(profiles);
  innerProfiles.push(newProfile);
  profiles.set(innerProfiles);
  selectedProfileIndex.set(innerProfiles.length - 1);
}

export function selectProfile(profileIndex) {
  selectedProfileIndex.set(profileIndex);
}

export function removeProfile(profile) {
  const innerProfiles = get(profiles);
  innerProfiles.splice(innerProfiles.indexOf(profile), 1);
  profiles.set(innerProfiles);
  if (innerProfiles.length == 0) {
    addProfile();
  } else {
    selectedProfileIndex.set(innerProfiles.length - 1);
  }
}

export function cloneProfile(profile) {
  const newProfile = lodashCloneDeep(profile);
  newProfile.title = 'Copy of ' + newProfile.title;
  const innerProfiles = get(profiles);
  innerProfiles.push(newProfile);
  profiles.set(innerProfiles);
  selectedProfileIndex.set(innerProfiles.length - 1);
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

export function sortProfiles(sortOrder) {
  profiles.set(lodashOrderBy(get(profiles), ['title'], [sortOrder]));
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
  profiles.set(innerProfiles);
  let profileIndex = 0;
  if (localStorage.selectedProfile) {
    profileIndex = Number(localStorage.selectedProfile);
  }
  if (profileIndex >= innerProfiles.length) {
    profileIndex = innerProfiles.length - 1;
  }
  selectedProfileIndex.set(profileIndex);
  if (localStorage.isPaused) {
    isPaused.set(true);
  }
  if (localStorage.lockedTabId) {
    isLocked.set(true);
  }
}

init();
