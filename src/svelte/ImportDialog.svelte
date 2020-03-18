<script>
  import lodashIsEmpty from "lodash/isEmpty";
  import lodashIsArray from "lodash/isArray";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { mdiClose, mdiFileImport, mdiCheck } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
  import { showMessage } from "../js/toast";
  import { overrideProfile, importProfiles } from "../js/datasource";

  let importTextbox;
  let importText;
  let dialog;
  let uploadFileInput;

  export function show() {
    importText = "";
    dialog.open();
  }

  function done() {
    try {
      let importedProfiles = JSON.parse(importText);
      if (!lodashIsArray(importedProfiles)) {
        importedProfiles = [importedProfiles];
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
      importText = event.target.result;
    };
    reader.readAsText(event.target.files[0]);
  }
</script>

<Dialog
  bind:this={dialog}
  class="import-dialog"
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
    <textarea
      bind:this={importTextbox}
      class="extra-large-textarea"
      rows="40"
      bind:value={importText} />
  </Content>
  <div class="mdc-dialog__actions">
    <input
      bind:this={uploadFileInput}
      type="file"
      class="hidden"
      on:change={loadFile} />
    <Button on:click={() => uploadFileInput.click()}>
      <MdiIcon size="24" icon={mdiFileImport} color={PRIMARY_COLOR} />
      <Label class="ml-small">Load from file</Label>
    </Button>
    <Button disabled={lodashIsEmpty(importText)} on:click={() => done()}>
      <MdiIcon
        size="24"
        icon={mdiCheck}
        color={lodashIsEmpty(importText) ? DISABLED_COLOR : PRIMARY_COLOR} />
      <Label class="ml-small">Import</Label>
    </Button>
  </div>
</Dialog>
