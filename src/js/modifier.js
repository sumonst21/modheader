import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashIsEqual from 'lodash/isEqual.js';
import cookie from 'cookie';
import { parse as parseSetCookie } from 'set-cookie-parser';
import { passFilters } from './filter.js';
import { redirectUrl } from './url-redirect.js';
import { evaluateValue } from './utils.js';

function isEnabled(chromeLocal, details) {
  if (chromeLocal.isPaused) {
    return false;
  }
  return !chromeLocal.lockedTabId || chromeLocal.lockedTabId === details.tabId;
}

export function modifyRequestUrls({ chromeLocal, activeProfiles, details }) {
  if (isEnabled(chromeLocal, details)) {
    let newUrl = details.url;
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: newUrl, type: details.type, profile: currentProfile })) {
        newUrl = redirectUrl({ urlRedirects: currentProfile.urlReplacements, url: newUrl });
      }
    }
    if (newUrl !== details.url) {
      return { redirectUrl: newUrl };
    }
  }
}

function modifyHeader(url, currentProfile, source, dest) {
  if (!source || !source.length) {
    return;
  }
  // Create an index map so that we can more efficiently override
  // existing header.
  const indexMap = {};
  for (let index = 0; index < dest.length; index++) {
    const header = dest[index];
    indexMap[header.name.toLowerCase()] = index;
  }
  for (const header of source) {
    const normalizedHeaderName = header.name.toLowerCase();
    const index = indexMap[normalizedHeaderName];
    const headerValue = evaluateValue({
      value: header.value,
      url,
      oldValue: index !== undefined ? dest[index].value : undefined
    });
    if (index !== undefined) {
      if (!currentProfile.appendMode || currentProfile.appendMode === 'false') {
        dest[index].value = headerValue;
      } else if (currentProfile.appendMode === 'comma') {
        if (dest[index].value) {
          dest[index].value += ',';
        }
        dest[index].value += headerValue;
      } else {
        dest[index].value += headerValue;
      }
    } else {
      dest.push({ name: header.name, value: headerValue });
      indexMap[normalizedHeaderName] = dest.length - 1;
    }
  }
}

function modifySetCookie(url, currentProfile, source, dest) {
  if (!source || !source.length) {
    return;
  }
  // Create an index map so that we can more efficiently override
  // existing header.
  const setCookieHeaderIndices = [];
  let cookieMap = {};
  for (let index = 0; index < dest.length; index++) {
    const header = dest[index];
    if (header.name.toLowerCase() === 'set-cookie') {
      const cookies = parseSetCookie(header.value);
      for (const c of cookies) {
        cookieMap[c.name] = c;
      }
      setCookieHeaderIndices.push(index);
    }
  }
  for (const cookie of source) {
    const cookieValue = cookieMap[cookie.name];
    const newHeaderValue = cookie.value;
    if (cookieValue !== undefined) {
      if (!currentProfile.appendMode || currentProfile.appendMode === 'false') {
        cookieMap[cookie.name].value = newHeaderValue;
      } else if (currentProfile.appendMode === 'comma') {
        if (cookieMap[cookie.name].value) {
          cookieMap[cookie.name].value += ',';
        }
        cookieMap[cookie.name].value += newHeaderValue;
      } else {
        cookieMap[cookie.name].value += newHeaderValue;
      }
    } else {
      cookieMap[cookie.name] = cookie;
    }
  }
  setCookieHeaderIndices.reverse();
  for (const [name, value] of Object.entries(cookieMap)) {
    if (!value.value && !currentProfile.sendEmptyHeader) {
      continue;
    }
    const serializedCookieHeader = cookie.serialize(name, value.value, value);
    if (setCookieHeaderIndices.length > 0) {
      const index = setCookieHeaderIndices.pop();
      dest[index].value = serializedCookieHeader;
    } else {
      dest.push({ name: 'set-cookie', value: serializedCookieHeader });
    }
  }
}

export function modifyRequestHeaders({ chromeLocal, activeProfiles, details }) {
  if (isEnabled(chromeLocal, details) && activeProfiles.length > 0) {
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, profile: currentProfile })) {
        modifyHeader(details.url, currentProfile, currentProfile.headers, details.requestHeaders);
        if (!currentProfile.sendEmptyHeader) {
          details.requestHeaders = details.requestHeaders.filter((entry) => !!entry.value);
        }
      }
    }
    return {
      requestHeaders: details.requestHeaders
    };
  }
}

export function modifyResponseHeaders({ chromeLocal, activeProfiles, details }) {
  if (isEnabled(chromeLocal, details) && activeProfiles.length > 0) {
    const originalResponseHeaders = details.responseHeaders || [];
    let responseHeaders = lodashCloneDeep(originalResponseHeaders);
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, profile: currentProfile })) {
        modifyHeader(details.url, currentProfile, currentProfile.respHeaders, responseHeaders);
        modifySetCookie(
          details.url,
          currentProfile,
          currentProfile.setCookieHeaders,
          responseHeaders
        );
        if (!currentProfile.sendEmptyHeader) {
          responseHeaders = responseHeaders.filter((entry) => !!entry.value);
        }
      }
    }
    if (!lodashIsEqual(responseHeaders, originalResponseHeaders)) {
      return {
        responseHeaders
      };
    }
  }
}
