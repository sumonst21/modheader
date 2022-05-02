import { get, derived, writable } from 'svelte/store';
import { removeLocal, setLocal } from './storage.js';
import { CURRENT_BROWSER } from './user-agent.js';
import { requireSignInDialog, requireSignInDialogContent } from './dialog.js';
import { getUserDetails } from './api.js';

export const signedInUser = writable(undefined);
export const isProUser = derived(
  [signedInUser],
  ([$signedInUser]) => $signedInUser && $signedInUser.subscription?.plan === 'pro',
  false
);

function openUrl({ path, query = {} }) {
  const url = new URL(`${process.env.URL_BASE}${path}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  chrome.tabs.create({ url: url.href });
}

export async function loadSignedInUser() {
  try {
    const user = await getUserDetails();
    await setLocal({ signedInUser: user });
    signedInUser.set(user);
  } catch (err) {
    console.error('Failed to fetch signed in user details', err);
  }
}

export async function goToMyAccount() {
  openUrl({ path: `/u/myaccount` });
}

export async function goToMySubscription() {
  openUrl({ path: `/u/mysubscription` });
}

export async function goToMyProfiles() {
  openUrl({ path: `/u/myprofiles` });
}

export async function signIn() {
  openUrl({
    path: '/login',
    query: {
      for: CURRENT_BROWSER,
      extension_id: chrome.runtime.id
    }
  });
}

export async function upgrade() {
  openUrl({
    path: '/pricing',
    query: {
      for: CURRENT_BROWSER,
      extension_id: chrome.runtime.id
    }
  });
}

export async function signOut() {
  await removeLocal(['signedInUser']);
  signedInUser.set(undefined);
  openUrl({ path: `/logout` });
}

export function getSignedInUser() {
  return get(signedInUser);
}

export function requireSignIn({ requireSignInContent }) {
  if (!getSignedInUser()) {
    requireSignInDialogContent.set(requireSignInContent);
    requireSignInDialog.set(true);
    return false;
  }
  return true;
}
