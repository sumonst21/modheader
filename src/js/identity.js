import { derived, writable } from 'svelte/store';
import { removeLocal, setLocal } from './storage.js';
import {CURRENT_BROWSER} from "./user-agent.js";

export const signedInUser = writable(undefined);
export const isProUser = derived(
  [signedInUser],
  ([$signedInUser]) => $signedInUser && $signedInUser.license === 'pro',
  false
);

export async function loadSignedInUser() {
  try {
    const response = await fetch(`${process.env.URL_BASE}/api/u/user-details`, {
      mode: 'cors',
      credentials: 'include'
    });
    if (response.ok) {
      const user = await response.json();
      await setLocal({ signedInUser: user });
      signedInUser.set(user);
    }
  } catch (err) {
    console.error('Failed to fetch signed in user details', err);
  }
}

export async function signIn() {
  const url = new URL(`${process.env.URL_BASE}/login`);
  url.searchParams.set('for', CURRENT_BROWSER);
  url.searchParams.set('extension_id', chrome.runtime.id);
  chrome.tabs.create({
    url: url.href
  });
}

export async function upgrade() {
  const url = new URL(`${process.env.URL_BASE}/login`);
  url.searchParams.set('for', CURRENT_BROWSER);
  url.searchParams.set('extension_id', chrome.runtime.id);
  chrome.tabs.create({
    url: url.href
  });
}

export async function signOut() {
  await removeLocal(['signedInUser']);
  signedInUser.set(undefined);
}
