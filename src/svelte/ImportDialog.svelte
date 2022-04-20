<script>
  import lodashIsEmpty from 'lodash/isEmpty.js';
  import lodashIsArray from 'lodash/isArray.js';
  import Button, { Label } from '@smui/button';
  import { mdiFileImport, mdiCheck } from '@mdi/js';
  import Textfield from '@smui/textfield';
  import lzString from 'lz-string';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import { DISABLED_COLOR, PRIMARY_COLOR } from '../js/constants.js';
  import { showMessage } from '../js/toast.js';
  import { getLocal } from '../js/storage.js';
  import { importProfiles } from '../js/profile.js';
  import { showImportDialog } from '../js/dialog.js';
  import { isChromiumBasedBrowser } from '../js/user-agent.js';

  const SHARE_URL_PREFIX = 'https://modheader.com/p/';
  const OLD_SHARE_URL_PREFIX = 'https://bewisse.com/modheader/p/';
  let importText = '';
  let uploadFileInput;

  showImportDialog.subscribe(async (show) => {
    if (show) {
      const { currentTabUrl } = await getLocal('currentTabUrl');
      if (
        currentTabUrl &&
        (currentTabUrl.startsWith(SHARE_URL_PREFIX) ||
          currentTabUrl.startsWith(OLD_SHARE_URL_PREFIX))
      ) {
        importText = currentTabUrl;
      } else {
        importText = '';
      }
    }
  });

  function done() {
    try {
      let importedProfiles;
      if (importText.startsWith(SHARE_URL_PREFIX) || importText.startsWith(OLD_SHARE_URL_PREFIX)) {
        const url = new URL(importText);
        const encodedProfile = !lodashIsEmpty(url.hash)
          ? url.hash.substring(1)
          : url.pathname.substring(url.pathname.lastIndexOf('/') + 1);
        importedProfiles = JSON.parse(lzString.decompressFromEncodedURIComponent(encodedProfile));
      } else {
        importedProfiles = JSON.parse(importText);
        if (!lodashIsArray(importedProfiles)) {
          importedProfiles = [importedProfiles];
        }
      }
      importProfiles(importedProfiles);
      showImportDialog.set(false);
    } catch (err) {
      showMessage('Failed to import profiles. Please double check your exported profile.');
    }
  }

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const importText = event.target.result;
      let importedProfiles = JSON.parse(importText);
      if (!lodashIsArray(importedProfiles)) {
        importedProfiles = [importedProfiles];
      }
      importProfiles(importedProfiles);
      showImportDialog.set(false);
    };
    reader.readAsText(file, 'utf8');
  }

  function openImportFilePage() {
    chrome.tabs.create(
      {
        url: chrome.runtime.getURL('/importfile.html')
      },
      () => {
        window.close();
      }
    );
  }
</script>

{#if $showImportDialog}
  <BaseDialog bind:open={$showImportDialog} title="Import profile">
    <div>Enter the URL / JSON encoded profile here to import.</div>
    <Textfield textarea class="extra-large-textarea" input$rows="40" bind:value={importText} />
    <svelte:fragment slot="footer">
      {#if isChromiumBasedBrowser()}
        <!-- Opening the file would close the popup in Firefox, so we can't support it. -->
        <input
          bind:this={uploadFileInput}
          type="file"
          class="hidden"
          on:change={(e) => loadFile(e.target.files[0])}
        />
        <Button on:click={() => uploadFileInput.click()}>
          <MdiIcon size="24" icon={mdiFileImport} color={PRIMARY_COLOR} />
          <Label class="ml-small">Load from file</Label>
        </Button>
      {:else}
        <Button on:click={() => openImportFilePage()}>
          <MdiIcon size="24" icon={mdiFileImport} color={PRIMARY_COLOR} />
          <Label class="ml-small">Load from file</Label>
        </Button>
      {/if}
      <Button disabled={lodashIsEmpty(importText)} on:click={() => done()}>
        <MdiIcon
          size="24"
          icon={mdiCheck}
          color={lodashIsEmpty(importText) ? DISABLED_COLOR : PRIMARY_COLOR}
        />
        <Label class="ml-small">Import</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}

<style module>
  .extra-large-textarea {
    width: 400px;
    height: 250px;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
