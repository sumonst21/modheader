<script>
  import lodashIsEmpty from "lodash/isEmpty";
  import lodashIsArray from "lodash/isArray";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import IconButton from "@smui/icon-button";
  import { mdiClose, mdiCheck } from "@mdi/js";
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
        importedProfiles = JSON.parse(
          lzString.decompressFromEncodedURIComponent(
            url.pathname.substring(url.pathname.lastIndexOf("/") + 1)
          )
        );
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
    <div>Enter the URL / JSON encoded profile here to import</div>
    <textarea
      bind:this={importTextbox}
      class="extra-large-textarea"
      rows="40"
      bind:value={importText} />
  </Content>
  <div class="mdc-dialog__actions">
    <Button disabled={lodashIsEmpty(importText)} on:click={() => done()}>
      <MdiIcon
        size="24"
        icon={mdiCheck}
        color={lodashIsEmpty(importText) ? DISABLED_COLOR : PRIMARY_COLOR} />
      <Label class="ml-small">Import</Label>
    </Button>
  </div>
</Dialog>
