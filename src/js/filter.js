import { getActiveTab } from './tabs.js';
import lodashIsEmpty from 'lodash/isEmpty.js';
import lodashCloneDeep from 'lodash/cloneDeep.js';

export const FilterType = {
  URLS: 'urls',
  EXCLUDE_URLS: 'excludeUrls',
  RESOURCE_TYPES: 'types'
};

export async function addFilter(filters) {
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
      type: FilterType.URLS,
      urlRegex: urlRegex,
      comment: '',
      resourceType: []
    }
  ];
}

export function removeFilter(filters, filterIndex) {
  filters = lodashCloneDeep(filters);
  filters.splice(filterIndex, 1);
  return filters;
}

export function optimizeFilters(filters) {
  if (!filters) {
    return undefined;
  }
  return filters
    .filter((f) => f.enabled)
    .map((f) => ({
      ...f,
      resourceType: new Set(f.resourceType),
      urlRegex: new RegExp(f.urlRegex)
    }));
}

/**
 * Check whether the current request url pass the given list of filters.
 */
export function passFilters({ url, type, filters }) {
  if (!filters) {
    return true;
  }
  let allowUrls = undefined;
  let hasUrlFilters = false;
  let allowTypes = false;
  let hasResourceTypeFilters = false;
  for (const filter of filters) {
    switch (filter.type) {
      case FilterType.URLS:
        hasUrlFilters = true;
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
        break;
      case FilterType.EXCLUDE_URLS:
        hasUrlFilters = true;
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
        break;
      case FilterType.RESOURCE_TYPES:
        hasResourceTypeFilters = true;
        if (filter.resourceType.has(type)) {
          allowTypes = true;
        }
        break;
    }
  }
  return (!hasUrlFilters || allowUrls) && (!hasResourceTypeFilters || allowTypes);
}
