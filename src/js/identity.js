import { writable } from 'svelte/store';
import { removeLocal, setLocal } from './storage.js';

export const signedInUser = writable(undefined);

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

export async function registerSignInChecker() {
  chrome.webRequest.onSendHeaders.removeListener(loadSignedInUser);
  chrome.webRequest.onSendHeaders.addListener(loadSignedInUser, {
    urls: [process.env.CHECK_LOGIN_URL, `${process.env.CHECK_LOGIN_URL}?*`]
  });
}

export async function signOut() {
  await removeLocal(['signedInUser']);
  signedInUser.set(undefined);
}
