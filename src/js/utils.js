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
        output.push({ name: row.name, value: row.value });
      }
    }
  }
  return output;
}
