import { getActiveTab, lookupTabInfo } from './tabs.js';
import lodashIsEmpty from 'lodash/isEmpty.js';
import lodashCloneDeep from 'lodash/cloneDeep.js';

export const FilterType = {
  TABS: 'tabs',
  TAB_GROUPS: 'tabGroups',
  WINDOWS: 'windows',
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

export async function addTabGroupFilter(filters) {
  const tab = await getActiveTab();
  return [
    ...filters,
    {
      enabled: true,
      comment: '',
      groupId: tab.groupId || ''
    }
  ];
}

export async function addWindowFilter(filters) {
  const tab = await getActiveTab();
  return [
    ...filters,
    {
      enabled: true,
      comment: '',
      windowId: tab.windowId || ''
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

export function optimizeTabFilters(filters) {
  if (!filters) {
    return [];
  }
  return filters.filter((f) => f.enabled);
}

/**
 * Check whether the current request url pass the given list of filters.
 */
export function passFilters({ url, type, tabId, profile }) {
  let allowUrls = undefined;
  let allowTypes = false;
  let allowTabs = false;
  let allowTabGroups = false;
  let allowWindows = false;
  for (const filter of profile.urlFilters) {
    if (allowUrls === undefined) {
      allowUrls = false;
    }
    try {
      if (filter.urlRegex.test(url)) {
        allowUrls = true;
        break;
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
        break;
      }
    } catch {
      allowUrls = true;
    }
  }
  for (const filter of profile.resourceFilters) {
    if (filter.resourceType.has(type)) {
      allowTypes = true;
      break;
    }
  }
  const tabInfo = lookupTabInfo(tabId) || {};
  allowTabs =
    profile.tabFilters.length === 0 || profile.tabFilters.some((filter) => filter.tabId === tabId);
  allowTabGroups =
    profile.tabGroupFilters.length === 0 ||
    profile.tabGroupFilters.some((filter) => filter.groupId === tabInfo.groupId);
  allowWindows =
    profile.windowFilters.length === 0 ||
    profile.windowFilters.some((filter) => filter.windowId === tabInfo.windowId);
  return (
    ((profile.urlFilters.length === 0 && profile.excludeUrlFilters.length === 0) || allowUrls) &&
    (profile.resourceFilters.length === 0 || allowTypes) &&
    allowTabs &&
    allowTabGroups &&
    allowWindows
  );
}
