import { get } from 'svelte/store';
import { ModifierType } from './modifier-type.js';
import { KNOWN_REQUEST_HEADERS, KNOWN_RESPONSE_HEADERS } from './constants.js';
import { profile } from '@modheader/core';
import { addHeader, addSetCookieHeader, removeHeader } from './header.js';
import AdvancedCookie from '../svelte/AdvancedCookie.svelte';
import AdvancedHeader from '../svelte/AdvancedHeader.svelte';
import { addUrlRedirect, removeUrlRedirect } from './url-redirect.js';

const { selectedProfile, updateProfile } = profile;

function getSelectedProfile() {
  return get(selectedProfile);
}

export const MODIFIER_TYPES = {
  [ModifierType.REQUEST_HEADER]: {
    title: 'Request headers',
    nameLabel: 'Name',
    valueLabel: 'Value',
    fieldName: 'headers',
    customAutocompleteFieldName: 'headersAutocomplete',
    autocompleteListId: 'request-autocomplete',
    autocompleteNames: KNOWN_REQUEST_HEADERS,
    supportAppendMode: true,
    advancedComponent: AdvancedHeader,
    addHandler: () => updateProfile({ headers: addHeader(getSelectedProfile().headers) }),
    removeHandler: (headerIndex) =>
      updateProfile({
        headers: removeHeader(getSelectedProfile().headers, headerIndex)
      }),
    refreshHandler: (data) => updateProfile({ headers: data })
  },
  [ModifierType.RESPONSE_HEADER]: {
    title: 'Response headers',
    nameLabel: 'Name',
    valueLabel: 'Value',
    fieldName: 'respHeaders',
    customAutocompleteFieldName: 'respHeadersAutocomplete',
    autocompleteListId: 'response-autocomplete',
    autocompleteNames: KNOWN_RESPONSE_HEADERS,
    supportAppendMode: true,
    advancedComponent: AdvancedHeader,
    addHandler: () =>
      updateProfile({
        respHeaders: addHeader(getSelectedProfile().respHeaders)
      }),
    removeHandler: (headerIndex) =>
      updateProfile({
        respHeaders: removeHeader(getSelectedProfile().respHeaders, headerIndex)
      }),
    refreshHandler: (data) => updateProfile({ respHeaders: data })
  },
  [ModifierType.COOKIE_MODIFIER]: {
    title: 'Cookie request modifiers',
    nameLabel: 'Name',
    valueLabel: 'Value',
    fieldName: 'cookieHeaders',
    customAutocompleteFieldName: 'cookieHeadersAutocomplete',
    advancedComponent: AdvancedHeader,
    addHandler: () =>
      updateProfile({
        cookieHeaders: addHeader(getSelectedProfile().cookieHeaders)
      }),
    removeHandler: (headerIndex) =>
      updateProfile({
        cookieHeaders: removeHeader(getSelectedProfile().cookieHeaders, headerIndex)
      }),
    refreshHandler: (data) => updateProfile({ cookieHeaders: data })
  },
  [ModifierType.SET_COOKIE_MODIFIER]: {
    title: 'Set-Cookie response modifiers',
    nameLabel: 'Name',
    valueLabel: 'Value',
    fieldName: 'setCookieHeaders',
    customAutocompleteFieldName: 'setCookieHeadersAutocomplete',
    advancedComponent: AdvancedCookie,
    addHandler: () =>
      updateProfile({
        setCookieHeaders: addSetCookieHeader(getSelectedProfile().setCookieHeaders)
      }),
    removeHandler: (headerIndex) =>
      updateProfile({
        setCookieHeaders: removeHeader(getSelectedProfile().setCookieHeaders, headerIndex)
      }),
    refreshHandler: (data) => updateProfile({ setCookieHeaders: data })
  },
  [ModifierType.URL_REPLACEMENT]: {
    title: 'Redirect URLs',
    nameLabel: 'Original URL',
    valueLabel: 'Redirect URL',
    fieldName: 'urlReplacements',
    customAutocompleteFieldName: 'urlReplacementsAutocomplete',
    addHandler: async () =>
      updateProfile({
        urlReplacements: await addUrlRedirect(getSelectedProfile().urlReplacements)
      }),
    removeHandler: (headerIndex) =>
      updateProfile({
        urlReplacements: removeUrlRedirect(getSelectedProfile().urlReplacements, headerIndex)
      }),
    refreshHandler: (data) => updateProfile({ urlReplacements: data })
  }
};
