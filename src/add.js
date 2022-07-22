import { storage, storageWriter } from '@modheader/core';

async function run() {
  let chromeLocal = await storage.getLocal(['profiles', 'selectedProfile']);
  const params = new URL(document.location).searchParams;

  const selectedProfile = chromeLocal.profiles[chromeLocal.selectedProfile];

  for (const entry of params.entries()) {
    selectedProfile.headers.push({
      name: entry[0],
      value: entry[1],
      enabled: true
    });
  }

  await storageWriter.setProfiles(chromeLocal.profiles);
  document.title = 'Done';
}
run();
