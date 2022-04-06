import App from '../svelte/FullscreenApp.svelte';
import { reloadColorScheme } from './color-scheme.js';

const app = new App({
  target: document.body
});

reloadColorScheme();

export default app;
