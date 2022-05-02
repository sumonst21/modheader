import { setProfiles, setSelectedProfileIndex } from './storage-writer.js';
import { PROFILE_VERSION, fixProfiles } from './profile.js';

export const MessageType = {
  EXISTS: 'EXISTS',
  IMPORT: 'IMPORT',
  SWITCH_TO_LATEST: 'SWITCH_TO_LATEST'
};

export async function onMessageReceived({ chromeLocal, request }) {
  switch (request.type) {
    case MessageType.EXISTS: {
      const manifest = chrome.runtime.getManifest();
      return {
        success: true,
        maxSupportedProfileVersion: PROFILE_VERSION,
        modHeaderVersion: manifest.version
      };
    }
    case MessageType.IMPORT: {
      const importedProfiles = [JSON.parse(request.profile)];
      fixProfiles(importedProfiles);
      chromeLocal.profiles.push(...importedProfiles);
      await setProfiles(chromeLocal.profiles);
      return { success: true };
    }
    case MessageType.SWITCH_TO_LATEST:
      await setSelectedProfileIndex(chromeLocal.profiles.length - 1);
      return { success: true };
    default:
      return false;
  }
}
