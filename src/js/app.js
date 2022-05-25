import App from '../svelte/FullscreenApp.svelte';
import { initProfileHooks } from './profile-hook.js';

initProfileHooks();

const app = new App({
  target: document.body
});

export default app;
