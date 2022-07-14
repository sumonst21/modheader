export function evaluateValue({ value, url, oldValue }) {
  // Note: Dynamic value is banned by Firefox and will need to be removed from other browsers by end of 2022.
  if (value && value.startsWith('function')) {
    try {
      const arg = JSON.stringify({ url, oldValue });
      return (eval(`(${value})(${arg})`) || '').toString();
    } catch (err) {
      console.error(err);
    }
  }
  return value;
}
