import { getActiveTab } from './tabs.js';
import lodashIsEmpty from 'lodash/isEmpty.js';
import lodashCloneDeep from 'lodash/cloneDeep.js';

export async function addUrlRedirect(urlReplacements) {
  let name = '';
  let value = '';
  const tab = await getActiveTab();
  if (tab && !lodashIsEmpty(tab.url)) {
    const url = new URL(tab.url);
    const { host, origin } = url;
    if (!lodashIsEmpty(host) && host !== 'null') {
      name = `.*://${host}/.*`;
    }
    if (!lodashIsEmpty(origin) && origin !== 'null') {
      value = origin;
    }
  }
  return [
    ...urlReplacements,
    {
      enabled: true,
      name,
      value,
      comment: ''
    }
  ];
}

export function removeUrlRedirect(urlReplacements, replacementIndex) {
  urlReplacements = lodashCloneDeep(urlReplacements);
  urlReplacements.splice(replacementIndex, 1);
  return urlReplacements;
}
