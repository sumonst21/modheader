export function setPreferredColorScheme(preferredColorScheme) {
  localStorage.preferredColorScheme = preferredColorScheme;
  reloadColorScheme();
}

export function reloadColorScheme() {
  const preferredColorScheme = localStorage.preferredColorScheme;
  const darkModeStylesheet = document.getElementById('dark-mode-stylesheet');
  if (preferredColorScheme === 'light') {
    darkModeStylesheet.setAttribute('disabled', 'disabled');
  } else if (preferredColorScheme === 'dark') {
    darkModeStylesheet.removeAttribute('disabled');
    darkModeStylesheet.removeAttribute('media');
  } else {
    darkModeStylesheet.removeAttribute('disabled');
    darkModeStylesheet.setAttribute('media', 'screen and (prefers-color-scheme: dark)');
  }
}
