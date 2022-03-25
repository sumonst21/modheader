import lodashCloneDeep from 'lodash/cloneDeep.js';
import lodashIsEqual from 'lodash/isEqual.js';
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
      if (passFilters({ url: newUrl, type: details.type, filters: currentProfile.filters })) {
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
      oldUrl: index !== undefined ? dest[index].value : undefined
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

export function modifyRequestHeaders({ chromeLocal, activeProfiles, details }) {
  if (isEnabled(chromeLocal, details) && activeProfiles.length > 0) {
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, filters: currentProfile.filters })) {
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
    let responseHeaders = lodashCloneDeep(details.responseHeaders);
    for (const currentProfile of activeProfiles) {
      if (passFilters({ url: details.url, type: details.type, filters: currentProfile.filters })) {
        modifyHeader(details.url, currentProfile, currentProfile.respHeaders, responseHeaders);
        if (!currentProfile.sendEmptyHeader) {
          responseHeaders = responseHeaders.filter((entry) => !!entry.value);
        }
      }
    }
    if (!lodashIsEqual(responseHeaders, details.responseHeaders)) {
      return {
        responseHeaders
      };
    }
  }
}
