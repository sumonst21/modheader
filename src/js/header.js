import lodashCloneDeep from 'lodash/cloneDeep.js';

export function createHeader() {
  return {
    enabled: true,
    name: '',
    value: '',
    comment: ''
  };
}

export function addHeader(headers) {
  return [...headers, createHeader()];
}

export function removeHeader(headers, headerIndex) {
  headers = lodashCloneDeep(headers);
  headers.splice(headerIndex, 1);
  return headers;
}
