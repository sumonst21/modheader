<script>
  import lodashIsArray from 'lodash/isArray';
  import Snackbar, { Actions, Label as SnackbarLabel } from '@smui/snackbar';
  import Button, { Label } from '@smui/button';
  import { mdiFileImport } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { PRIMARY_COLOR } from '../js/constants';
  import { importProfiles, save } from '../js/datasource';

  let snackbar;
  let uploadFileInput;
  let showDragOverMessage = false;

  function loadFile(file) {
    showDragOverMessage = false;
    const reader = new FileReader();
    reader.onload = (event) => {
      const importText = event.target.result;
      let importedProfiles = JSON.parse(importText);
      if (!lodashIsArray(importedProfiles)) {
        importedProfiles = [importedProfiles];
      }
      importProfiles(importedProfiles);
      save();
      snackbar.open();
    };
    reader.readAsText(file, 'utf8');
  }

  function close() {
    window.close();
  }
</script>

<div
  on:dragover|preventDefault={() => (showDragOverMessage = true)}
  on:dragexit|preventDefault={() => (showDragOverMessage = false)}
  on:drop|preventDefault={(e) => loadFile(e.dataTransfer.items[0].getAsFile())}
>
  <div>
    Due to browser restriction, please click on "Load from file" again to select the file you want
    to import.
  </div>
  <div>You can also drag-and-drop the file here.</div>
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

  {#if showDragOverMessage}
    <div>Drop the file here to import</div>
  {/if}

  <Snackbar timeoutMs={10000} bind:this={snackbar}>
    <SnackbarLabel>File is imported. You may close this page</SnackbarLabel>
    <Actions>
      <Button on:click={() => close()}>Close</Button>
    </Actions>
  </Snackbar>
</div>

<style>
  :global(html, body) {
    font-family: Roboto, Helvetica Neue, sans-serif;
    position: relative !important;
    overflow-x: hidden;
    margin: 10px;
  }

  .hidden {
    display: none;
  }
</style>
