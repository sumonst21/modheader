import App from '../svelte/FullscreenApp.svelte';
import { appMode } from './app-mode.js';

appMode.set('app');
const app = new App({
  target: document.body
});

export default app;
