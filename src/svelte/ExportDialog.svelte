<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Snackbar, { Label as SnackbarLabel } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Checkbox from "@smui/checkbox";
  import List, { Item, Separator, Text } from "@smui/list";
  import { mdiSelectAll, mdiContentCopy, mdiDownload, mdiClose } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import { profiles, selectedProfile, commitChange } from "../js/datasource";

  let exportTextbox;
  let dialog;
  let snackbar;
  let selectedProfiles = [];

  export function show() {
    selectedProfiles = [$selectedProfile];
    dialog.open();
  }

  function copyExportText() {
    exportTextbox.select();
    document.execCommand("copy");
    snackbar.open();
  }

  $: exportedText = JSON.stringify(selectedProfiles);
</script>

<Dialog
  bind:this={dialog}
  class="export-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content">
  <Title id="dialog-title">
    Export profile
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => dialog.close()}>
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    Select the profiles to export
    <List checklist>
      {#each $profiles as profile}
        <Item>
          <Checkbox bind:group={selectedProfiles} value={profile} />
          {profile.title}
        </Item>
      {/each}
    </List>
    <textarea
      bind:this={exportTextbox}
      on:focus={() => copyExportText()}
      class="extra-large-textarea"
      rows="40"
      readonly
      value={exportedText} />
  </Content>
  <div class="mdc-dialog__actions">
    <Button on:click={() => (selectedProfiles = [...$profiles])}>
      <MdiIcon size="24" icon={mdiSelectAll} color="#1976d2" />
      &nbsp;
      <Label>Select all</Label>
    </Button>
    <Button on:click={() => exportTextbox.focus()}>
      <MdiIcon size="24" icon={mdiContentCopy} color="#1976d2" />
      &nbsp;
      <Label>Copy</Label>
    </Button>
    <Button
      href="data:application/json;base64,{window.btoa(exportedText)}"
      download="{selectedProfiles.map(p => p.title).join('+')}.json">
      <MdiIcon size="24" icon={mdiDownload} color="#1976d2" />
      &nbsp;
      <Label>Download</Label>
    </Button>
  </div>
</Dialog>

<Snackbar timeoutMs={4000} bind:this={snackbar}>
  <SnackbarLabel>Copied to clipboard!</SnackbarLabel>
</Snackbar>
