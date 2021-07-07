<script>
  import { encode } from "js-base64";
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import Button, { Label } from "@smui/button";
  import Tab, { Icon, Label as TabLabel } from "@smui/tab";
  import TabBar from "@smui/tab-bar";
  import Snackbar, { Label as SnackbarLabel } from "@smui/snackbar";
  import IconButton from "@smui/icon-button";
  import Checkbox from "@smui/checkbox";
  import List, { Item, Separator, Text } from "@smui/list";
  import lzString from "lz-string";
  import { mdiDownload, mdiSelectAll, mdiContentCopy, mdiClose } from "@mdi/js";
  import MdiIcon from "./MdiIcon.svelte";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
  import { showMessage } from "../js/toast";
  import { profiles, selectedProfile, commitChange } from "../js/datasource";

  const TABS = [
    { label: "URL", value: "url" },
    { label: "JSON", value: "json" }
  ];
  let activeTab = TABS[0];
  let exportUrlTextbox;
  let exportJsonTextbox;
  let dialog;
  let selectedProfiles = [];

  export function show() {
    selectedProfiles = [$selectedProfile];
    dialog.open();
  }

  async function copyExportText(textbox) {
    textbox.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(exportedUrl);
    } else {
      document.execCommand("copy");
    }
    showMessage("Copied to clipboard!");
  }

  $: exportedText = JSON.stringify(selectedProfiles);
  $: exportedUrl = `https://modheader.com/p/${lzString.compressToEncodedURIComponent(
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

    <TabBar tabs={TABS} let:tab bind:active={activeTab}>
      <Tab {tab}>
        <TabLabel>{tab.label}</TabLabel>
      </Tab>
    </TabBar>
    {#if activeTab.value === 'url'}
      <input
        bind:this={exportUrlTextbox}
        on:focus={() => copyExportText(exportUrlTextbox)}
        class="export-text-field"
        type="url"
        readonly
        value={exportedUrl} />
    {:else}
      <input
        bind:this={exportJsonTextbox}
        on:focus={() => copyExportText(exportJsonTextbox)}
        class="export-text-field"
        type="text"
        readonly
        value={exportedText} />
    {/if}
  </Content>
  <div class="mdc-dialog__actions">
    <Button on:click={() => (selectedProfiles = [...$profiles])}>
      <MdiIcon size="24" icon={mdiSelectAll} color={PRIMARY_COLOR} />
      <Label class="ml-small">Select All</Label>
    </Button>
    {#if activeTab.value === 'json'}
      {#if selectedProfiles.length === 0}
        <Button disabled>
          <MdiIcon size="24" icon={mdiDownload} color={DISABLED_COLOR} />
          <Label class="ml-small">Download JSON</Label>
        </Button>
      {:else}
        <Button
          href="data:application/json;base64,{encode(exportedText)}"
          download="{selectedProfiles.map(p => p.title).join('+')}.json">
          <MdiIcon size="24" icon={mdiDownload} color={PRIMARY_COLOR} />
          <Label class="ml-small">Download JSON</Label>
        </Button>
      {/if}
    {/if}
    {#if activeTab.value === 'url'}
      <Button
        disabled={selectedProfiles.length === 0}
        on:click={() => exportUrlTextbox.focus()}>
        <MdiIcon
          size="24"
          icon={mdiContentCopy}
          color={selectedProfiles.length === 0 ? DISABLED_COLOR : PRIMARY_COLOR} />
        <Label class="ml-small">Copy URL</Label>
      </Button>
    {/if}
  </div>
</Dialog>
