function hslToRgb(h, s, l){
  let r, g, b;
  if (s == 0){
      r = g = b = l; // achromatic
  } else {
      function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(v) {
  return Math.round(v * 255).toString(16).padStart(2, '0');
}

export function toRgbString(rgb) {
  return `#${toHex(rgb.r / 255)}${toHex(rgb.g / 255)}${toHex(rgb.b / 255)}`;
}

export function generateBackgroundColor() {
  return hslToRgb(Math.random(), Math.random(), Math.random() * .4);
}

export function generateTextColor() {
  return '#ffffff';
}

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
