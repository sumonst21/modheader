import { writable } from 'svelte/store';

export const toastMessage = writable('');

export function showMessage(message) {
  toastMessage.set(message);
}
