export function takeRight(v) {
  const s = v.toString();
  return s.length > 0 ? s[s.length - 1] : '0';
}

export function filterEnabledMods(rows) {
  let output = [];
  if (rows) {
    for (const row of rows) {
      // Overrides the header if it is enabled and its name is not empty.
      if (row.enabled && row.name) {
        const rowCopy = { ...row };
        delete rowCopy.enabled;
        delete rowCopy.comment;
        output.push(rowCopy);
      }
    }
  }
  return output;
}

export function evaluateValue({ value, url, oldValue }) {
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
