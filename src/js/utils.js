export function takeRight(v) {
  const s = v.toString();
  return s[s.length - 1];
}

export function createHeader() {
  return {
    enabled: true,
    name: '',
    value: '',
    comment: ''
  };
}
