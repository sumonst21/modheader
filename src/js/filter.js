import { getActiveTab } from './tabs.js';
import lodashIsEmpty from 'lodash/isEmpty.js';
import lodashCloneDeep from 'lodash/cloneDeep.js';

export const FilterType = {
  TABS: 'tabs',
  TAB_GROUPS: 'tabGroups',
  URLS: 'urls',
  EXCLUDE_URLS: 'excludeUrls',
  RESOURCE_TYPES: 'types'
};

export async function addUrlFilter(filters) {
  let urlRegex = '';
  const tab = await getActiveTab();
  if (tab && !lodashIsEmpty(tab.url)) {
    const host = new URL(tab.url).host;
    if (!lodashIsEmpty(host) && host !== 'null') {
      urlRegex = `.*://${host}/.*`;
    }
  }
  return [
    ...filters,
    {
      enabled: true,
      urlRegex: urlRegex,
      comment: ''
    }
  ];
}

export async function addResourceFilter(filters) {
  return [
    ...filters,
    {
      enabled: true,
      comment: '',
      resourceType: []
    }
  ];
}

export async function addTabFilter(filters) {
  const tab = await getActiveTab();
  return [
    ...filters,
    {
      enabled: true,
      comment: '',
      tabId: tab.id || ''
    }
  ];
}

export function removeFilter(filters, filterIndex) {
  filters = lodashCloneDeep(filters);
  filters.splice(filterIndex, 1);
  return filters;
}

export function optimizeUrlFilters(filters) {
  if (!filters) {
    return [];
  }
  return filters
    .filter((f) => f.enabled)
    .map((f) => ({
      ...f,
      urlRegex: new RegExp(f.urlRegex)
    }));
}

export function optimizeResourceFilters(filters) {
  if (!filters) {
    return [];
  }
  return filters
    .filter((f) => f.enabled)
    .map((f) => ({
      ...f,
      resourceType: new Set(f.resourceType)
    }));
}

/**
 * Check whether the current request url pass the given list of filters.
 */
export function passFilters({ url, type, profile }) {
  let allowUrls = undefined;
  let allowTypes = false;
  for (const filter of profile.urlFilters) {
    if (allowUrls === undefined) {
      allowUrls = false;
    }
    try {
      if (filter.urlRegex.test(url)) {
        allowUrls = true;
      }
    } catch {
      allowUrls = false;
    }
  }
  for (const filter of profile.excludeUrlFilters) {
    if (allowUrls === undefined) {
      allowUrls = true;
    }
    try {
      if (filter.urlRegex.test(url)) {
        allowUrls = false;
      }
    } catch {
      allowUrls = true;
    }
  }
  for (const filter of profile.resourceFilters) {
    if (filter.resourceType.has(type)) {
      allowTypes = true;
    }
  }
  return (
    ((profile.urlFilters.length === 0 && profile.excludeUrlFilters.length === 0) || allowUrls) &&
    (profile.resourceFilters.length === 0 || allowTypes)
  );
}
