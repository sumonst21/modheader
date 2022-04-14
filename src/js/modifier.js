import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashIsEqual from 'lodash/isEqual.js';
import cookie from 'cookie';
import { parse as parseSetCookie } from 'set-cookie-parser';
import { passFilters } from './filter.js';
import { redirectUrl } from './url-redirect.js';
import { evaluateValue } from './utils.js';
import { AppendMode } from './append-mode.js';

function isEnabled(chromeLocal) {
  return !chromeLocal.isPaused;
}

export function modifyRequestUrls({ chromeLocal, activeProfiles, details }) {
  if (isEnabled(chromeLocal)) {
    let newUrl = details.url;
    for (const currentProfile of activeProfiles) {
      if (
        passFilters({
          url: newUrl,
          type: details.type,
          tabId: details.tabId,
          profile: currentProfile
        })
      ) {
        newUrl = redirectUrl({ urlRedirects: currentProfile.urlReplacements, url: newUrl });
      }
    }
    if (newUrl !== details.url) {
      return { redirectUrl: newUrl };
    }
  }
}

function handleAppendMode({ appendMode, originalValue, newValue }) {
  switch (appendMode) {
    case AppendMode.COMMA_SEPARATED_APPEND:
      if (originalValue) {
        return originalValue + ',' + newValue;
      }
      return newValue;
    case AppendMode.APPEND:
      return originalValue + newValue;
    default:
      return newValue;
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
      dest[index].value = handleAppendMode({
        appendMode: header.appendMode,
        originalValue: dest[index].value,
        newValue: headerValue
      });
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
    if (cookie.attributeOverride || !cookieMap[cookie.name]) {
      cookieMap[cookie.name] = cookie;
    } else {
      cookieMap[cookie.name].value = cookie.value;
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
  if (isEnabled(chromeLocal) && activeProfiles.length > 0) {
    for (const currentProfile of activeProfiles) {
      if (
        passFilters({
          url: details.url,
          type: details.type,
          tabId: details.tabId,
          profile: currentProfile
        })
      ) {
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
  if (isEnabled(chromeLocal) && activeProfiles.length > 0) {
    const originalResponseHeaders = details.responseHeaders || [];
    let responseHeaders = lodashCloneDeep(originalResponseHeaders);
    for (const currentProfile of activeProfiles) {
      if (
        passFilters({
          url: details.url,
          type: details.type,
          tabId: details.tabId,
          profile: currentProfile
        })
      ) {
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
