import { takeRight } from './utils';
import { createHeader } from './header';
import { generateBackgroundColor, generateTextColor } from './color';

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
    if (!profile.title) {
      profile.title = 'Profile ' + (index + 1);
      isMutated = true;
    }
    if (!profile.shortTitle) {
      profile.shortTitle = takeRight(index + 1);
      isMutated = true;
    }
    if (!profile.headers) {
      profile.headers = [createHeader()];
      isMutated = true;
    }
    if (!profile.respHeaders) {
      profile.respHeaders = [];
      isMutated = true;
    }
    if (!profile.urlReplacements) {
      profile.urlReplacements = [];
      isMutated = true;
    }
    if (!profile.filters) {
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
    if (profile.textColor) {
      profile.textColor = generateTextColor();
      isMutated = true;
    }
  }
  return isMutated;
}
