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
const sandboxProxies = new WeakMap();

function compileCode(src) {
  src = 'with (sandbox) {' + src + '}';
  const code = new Function('sandbox', src);

  return function (sandbox) {
    if (!sandboxProxies.has(sandbox)) {
      const sandboxProxy = new Proxy(sandbox, { has, get });
      sandboxProxies.set(sandbox, sandboxProxy);
    }
    return code(sandboxProxies.get(sandbox));
  };
}

function has() {
  return true;
}

function get(target, key) {
  if (key === Symbol.unscopables) return undefined;
  return target[key];
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
