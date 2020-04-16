<script>
  import lodashIsEmpty from "lodash/isEmpty";
  import lodashIsArray from "lodash/isArray";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { mdiClose, mdiFileImport, mdiCheck } from "@mdi/js";
  import lzString from "lz-string";
  import MdiIcon from "./MdiIcon.svelte";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
  import { showMessage } from "../js/toast";
  import { getLocal } from "../js/storage";
  import { overrideProfile, importProfiles } from "../js/datasource";

  const SHARE_URL_PREFIX = "https://bewisse.com/modheader/p/";
  let importTextbox;
  let importText;
  let dialog;
  let uploadFileInput;

  export async function show() {
    const { currentTabUrl } = await getLocal("currentTabUrl");
    if (currentTabUrl && currentTabUrl.startsWith(SHARE_URL_PREFIX)) {
      importText = currentTabUrl;
    } else {
      importText = "";
    }
    dialog.open();
  }

  function done() {
    try {
      let importedProfiles;
      if (importText.startsWith(SHARE_URL_PREFIX)) {
        const url = new URL(importText);
        const encodedProfile = !lodashIsEmpty(url.hash) ? url.hash.substring(1) : url.pathname.substring(url.pathname.lastIndexOf("/") + 1);
        importedProfiles = JSON.parse(lzString.decompressFromEncodedURIComponent(encodedProfile));
      } else {
        importedProfiles = JSON.parse(importText);
        if (!lodashIsArray(importedProfiles)) {
          importedProfiles = [importedProfiles];
        }
      }
      importProfiles(importedProfiles);
      dialog.close();
    } catch (err) {
      showMessage(
        "Failed to import profiles. Please double check your exported profile."
      );
    }
  }

  function loadFile(event) {
    const reader = new FileReader();
    reader.onload = event => {
      const importText = event.target.result;
      const importedProfiles = JSON.parse(importText);
      if (!lodashIsArray(importedProfiles)) {
        importedProfiles = [importedProfiles];
      }
      importProfiles(importedProfiles);
      dialog.close();
    };
    reader.readAsText(event.target.files[0]);
  }
</script>

<style>
  .extra-large-textarea {
    width: 400px;
    height: 250px;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>

<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content">
  <Title id="dialog-title">
    Import profile
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => dialog.close()}>
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    <div>Enter the URL / JSON encoded profile here to import</div>
    <textarea
      bind:this={importTextbox}
      class="extra-large-textarea"
      rows="40"
      bind:value={importText} />
  </Content>
  <div class="mdc-dialog__actions">
    {#if process.env.BROWSER !== 'firefox'}
      <!-- Opening the file would close the popup in Firefox, so we can't support it. -->
      <input
        bind:this={uploadFileInput}
        type="file"
        class="hidden"
        on:change={loadFile} />
      <Button on:click={() => uploadFileInput.click()}>
        <MdiIcon size="24" icon={mdiFileImport} color={PRIMARY_COLOR} />
        <Label class="ml-small">Load from file</Label>
      </Button>
    {/if}
    <Button disabled={lodashIsEmpty(importText)} on:click={() => done()}>
      <MdiIcon
        size="24"
        icon={mdiCheck}
        color={lodashIsEmpty(importText) ? DISABLED_COLOR : PRIMARY_COLOR} />
      <Label class="ml-small">Import</Label>
    </Button>
  </div>
</Dialog>
