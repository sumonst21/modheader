import { setLocal, removeLocal } from './storage.js';

export async function setProfiles(profiles) {
  await setLocal({ profiles });
}

export async function setSelectedProfileIndex(index) {
  await setLocal({ selectedProfile: index });
}

export async function setPaused(isPaused) {
  if (isPaused) {
    await setLocal({ isPaused: true });
  } else {
    await removeLocal('isPaused');
  }
}
