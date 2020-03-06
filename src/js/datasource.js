export let profiles = [];
export let isPaused = false;
export let lockedTabId;
export let selectedProfile;

function isExistingProfileTitle_(title) {
  for (let i = 0; i < profiles.length; ++i) {
    if (profiles[i].title == title) {
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

export function addFilter(filters) {
  let urlRegex = '';
  if (localStorage.currentTabUrl) {
    const parser = document.createElement('a');
    parser.href = localStorage.currentTabUrl;
    urlRegex = parser.origin + '/.*';
  }
  filters.push({
    enabled: true,
    type: 'urls',
    urlRegex: urlRegex,
    resourceType: []
  });
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

export function removeFilter(filters, filter) {
  filters.splice(filters.indexOf(filter), 1);
}

export function removeHeader(headers, header) {
  headers.splice(headers.indexOf(header), 1);
}

export function removeUrlReplacement(urlReplacements, replacement) {
  urlReplacements.splice(urlReplacements.indexOf(replacement), 1);
}

export function removeHeaderEnsureNonEmpty(headers, header) {
  removeHeader(headers, header);
  if (!headers.length) {
    addHeader(headers);
  }
}

export function pause() {
  isPaused = true;
  localStorage.isPaused = true;
  // $mdToast.show(
  //   $mdToast
  //     .simple()
  //     .content('ModHeader paused')
  //     .position('bottom')
  //     .hideDelay(1000)
  // );
}

export function play() {
  isPaused = false;
  localStorage.removeItem('isPaused');
  // $mdToast.show(
  //   $mdToast
  //     .simple()
  //     .content('ModHeader unpaused')
  //     .position('bottom')
  //     .hideDelay(1000)
  // );
}

export function lockToTab() {
  lockedTabId = localStorage.activeTabId;
  localStorage.lockedTabId = lockedTabId;
  // $mdToast.show(
  //   $mdToast
  //     .simple()
  //     .content('Restricted ModHeader to the current tab')
  //     .position('bottom')
  //     .hideDelay(1000)
  // );
}

export function unlockAllTab() {
  lockedTabId = null;
  localStorage.removeItem('lockedTabId');
  // $mdToast.show(
  //   $mdToast
  //     .simple()
  //     .content('Applying ModHeader to all tabs')
  //     .position('bottom')
  //     .hideDelay(1000)
  // );
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

export function addProfile() {
  const newProfile = createProfile();
  profiles.push(newProfile);
  selectedProfile = newProfile;
}

export function selectProfile(profile) {
  selectedProfile = profile;
}

export function removeProfile(profile) {
  profiles.splice(profiles.indexOf(profile), 1);
  if (profiles.length == 0) {
    addProfile();
  } else {
    selectedProfile = profiles[profiles.length - 1];
  }
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

export function save() {
  const serializedProfiles = JSON.stringify(profiles);
  const selectedProfileIndex = profiles.indexOf(selectedProfile);
  localStorage.profiles = serializedProfiles;
  localStorage.selectedProfile = selectedProfileIndex;
}

function init() {
  if (localStorage.profiles) {
    profiles = JSON.parse(localStorage.profiles);
    for (let profile of profiles) {
      fixProfile(profile);
    }
  } else {
    profiles = [];
  }
  if (profiles.length == 0) {
    profiles.push(createProfile());
  }
  for (let index in profiles) {
    const profile = profiles[index];
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
  if (localStorage.selectedProfile) {
    selectedProfile = profiles[Number(localStorage.selectedProfile)];
  }
  if (!selectedProfile) {
    selectedProfile = profiles[0];
  }
  if (localStorage.isPaused) {
    isPaused = localStorage.isPaused;
  }
  if (localStorage.lockedTabId) {
    lockedTabId = localStorage.lockedTabId;
  }
}

init();
