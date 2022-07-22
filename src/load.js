import { profile, storageWriter } from '@modheader/core';
import { initProfileHooks } from './js/profile-hook.js';

initProfileHooks();

async function run() {
  const params = new URL(document.location).searchParams;
  const importedProfiles = [JSON.parse(params.get('profile'))];
  profile.fixProfiles(importedProfiles);
  await storageWriter.setProfilesAndIndex(importedProfiles, importedProfiles.length - 1);
  document.title = 'Done';
}
run();
