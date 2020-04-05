<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Snackbar, { Label as SnackbarLabel } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Checkbox from "@smui/checkbox";
  import List, { Item, Separator, Text } from "@smui/list";
  import lzString from "lz-string";
  import { mdiSelectAll, mdiContentCopy, mdiClose } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
  import { showMessage } from "../js/toast";
  import { profiles, selectedProfile, commitChange } from "../js/datasource";

  let exportTextbox;
  let dialog;
  let selectedProfiles = [];

  export function show() {
    selectedProfiles = [$selectedProfile];
    dialog.open();
  }

  async function copyExportText() {
    exportTextbox.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(exportedUrl);
    } else {
      document.execCommand("copy");
    }
    showMessage("Copied to clipboard!");
  }

  $: exportedText = JSON.stringify(selectedProfiles);
  $: exportedUrl = `https://bewisse.com/modheader/p/${lzString.compressToEncodedURIComponent(
    exportedText
  )}`;
</script>

<style scoped>
  .export-text-field {
    width: 100%;
    font-size: 1.4em;
  }
</style>

<Dialog
  bind:this={dialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content">
  <Title id="dialog-title">
    Export / share profile(s)
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => dialog.close()}>
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    Select 1 or more profiles to share / export.
    <br />
    Be careful about sharing sensitive data!
    <List checklist>
      {#each $profiles as profile}
        <Item>
          <Checkbox bind:group={selectedProfiles} value={profile} />
          {profile.title}
        </Item>
      {/each}
    </List>
    <input
      bind:this={exportTextbox}
      on:focus={() => copyExportText()}
      class="export-text-field"
      type="url"
      readonly
      value={exportedUrl} />
  </Content>
  <div class="mdc-dialog__actions">
    <Button on:click={() => (selectedProfiles = [...$profiles])}>
      <MdiIcon size="24" icon={mdiSelectAll} color={PRIMARY_COLOR} />
      <Label class="ml-small">Select All</Label>
    </Button>
    <Button
      disabled={selectedProfiles.length === 0}
      on:click={() => exportTextbox.focus()}>
      <MdiIcon
        size="24"
        icon={mdiContentCopy}
        color={selectedProfiles.length === 0 ? DISABLED_COLOR : PRIMARY_COLOR} />
      <Label class="ml-small">Copy</Label>
    </Button>
  </div>
</Dialog>
