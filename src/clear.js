import { profile, storageWriter } from '@modheader/core';
import { initProfileHooks } from './js/profile-hook.js';

initProfileHooks();

async function run() {
  await storageWriter.setProfilesAndIndex([profile.createProfile()], 0);
  document.title = 'Done';
}
run();
