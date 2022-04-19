import { setProfiles, setSelectedProfileIndex } from './storage-writer.js';
import { fixProfiles } from './profile.js';

export const MessageType = {
  EXISTS: 'EXISTS',
  IMPORT: 'IMPORT',
  SWITCH_TO_LATEST: 'SWITCH_TO_LATEST'
};

export async function onMessageReceived({ chromeLocal, request }) {
  switch (request.type) {
    case MessageType.EXISTS:
      return true;
    case MessageType.IMPORT: {
      const importedProfiles = [JSON.parse(request.profile)];
      fixProfiles(importedProfiles);
      chromeLocal.profiles.push(...importedProfiles);
      await setProfiles(chromeLocal.profiles);
      return true;
    }
    case MessageType.SWITCH_TO_LATEST:
      await setSelectedProfileIndex(chromeLocal.profiles.length - 1);
      return true;
    default:
      return false;
  }
}
