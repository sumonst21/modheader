const LIGHT_STYLE_SHEET_PARAMS = {
  id: 'light-mode-stylesheet',
  rel: 'stylesheet',
  href: 'styles/smui.css'
};
const DARK_STYLE_SHEET_PARAMS = {
  id: 'dark-mode-stylesheet',
  rel: 'stylesheet',
  href: 'styles/smui-dark.css'
};

export function setPreferredColorScheme(preferredColorScheme) {
  localStorage.preferredColorScheme = preferredColorScheme;
  reloadColorScheme();
}

function addStyleSheet(params) {
  const link = document.createElement('link');
  for (const [key, value] of Object.entries(params)) {
    link[key] = value;
  }
  document.head.prepend(link);
}

function ensureStyleSheet(params) {
  const styleSheet = document.getElementById(params.id);
  if (!styleSheet) {
    addStyleSheet(params);
  }
}

function removeStyleSheet(params) {
  const styleSheet = document.getElementById(params.id);
  if (styleSheet) {
    styleSheet.remove();
  }
}

export function reloadColorScheme() {
  const preferredColorScheme = localStorage.preferredColorScheme;
  if (preferredColorScheme === 'light') {
    removeStyleSheet(DARK_STYLE_SHEET_PARAMS);
    ensureStyleSheet(LIGHT_STYLE_SHEET_PARAMS);
  } else if (preferredColorScheme === 'dark') {
    removeStyleSheet(LIGHT_STYLE_SHEET_PARAMS);
    ensureStyleSheet(DARK_STYLE_SHEET_PARAMS);
  } else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      removeStyleSheet(LIGHT_STYLE_SHEET_PARAMS);
      ensureStyleSheet(DARK_STYLE_SHEET_PARAMS);
    } else {
      removeStyleSheet(DARK_STYLE_SHEET_PARAMS);
      ensureStyleSheet(LIGHT_STYLE_SHEET_PARAMS);
    }
  }
}
