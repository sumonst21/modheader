<script>
  import { encode } from 'js-base64';
  import Dialog, { Title, Content } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import TabBar from '@smui/tab-bar';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import List, { Meta, Item, Label as ListLabel } from '@smui/list';
  import lzString from 'lz-string';
  import { mdiDownload, mdiContentCopy, mdiClose } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { DISABLED_COLOR, PRIMARY_COLOR } from '../js/constants.js';
  import { showMessage } from '../js/toast.js';
  import { profiles } from '../js/datasource.js';
  import { showExportDialog } from '../js/dialog.js';
  import { selectedProfile, exportProfiles } from '../js/profile';

  const TABS = [
    { label: 'URL', value: 'url' },
    { label: 'JSON', value: 'json' }
  ];
  let activeTab = TABS[0];
  let exportUrlTextbox;
  let exportJsonTextbox;
  let selectedProfiles = [];
  let keepStyles = false;

  async function copyExportText(textbox, content) {
    if (!selectedProfiles.length) {
      return;
    }
    textbox.getElement().querySelector('textarea').select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
    } else {
      document.execCommand('copy');
    }
    showMessage('Copied to clipboard!');
  }

  showExportDialog.subscribe((show) => {
    if (show) {
      selectedProfiles = [$selectedProfile];
    }
  });

  $: exportedText =
    selectedProfiles.length > 0
      ? exportProfiles(selectedProfiles, { keepStyles })
      : 'Select a profile to export';
  $: exportedUrl =
    selectedProfiles.length > 0
      ? `https://modheader.com/p/${lzString.compressToEncodedURIComponent(exportedText)}`
      : 'Select a profile to export';
</script>

<Dialog
  bind:open={$showExportDialog}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
>
  <Title id="dialog-title">
    Export / share selected profile(s)
    <IconButton
      aria-label="Close"
      class="dialog-close-button"
      on:click={() => showExportDialog.set(false)}
    >
      <MdiIcon size="32" icon={mdiClose} color="#888" />
    </IconButton>
  </Title>
  <Content id="dialog-content">
    <div class="export-dialog-content">
      <List checklist>
        {#each $profiles as profile}
          <Item>
            <Meta>
              <Checkbox bind:group={selectedProfiles} value={profile} />
            </Meta>
            <ListLabel>{profile.title}</ListLabel>
          </Item>
        {/each}
      </List>

      <div class="grid-border" />

      <div>
        <TabBar tabs={TABS} let:tab bind:active={activeTab}>
          <Tab {tab}>
            <TabLabel>{tab.label}</TabLabel>
          </Tab>
        </TabBar>
        {#if activeTab.value === 'url'}
          <Textfield
            bind:this={exportUrlTextbox}
            on:focus={() => copyExportText(exportUrlTextbox, exportedUrl)}
            class="export-text-field"
            type="url"
            input$rows="5"
            textarea
            readonly
            disabled={selectedProfiles.length === 0}
            value={exportedUrl}
          />
        {:else}
          <Textfield
            bind:this={exportJsonTextbox}
            on:focus={() => copyExportText(exportJsonTextbox, exportedText)}
            class="export-text-field"
            input$rows="5"
            textarea
            readonly
            disabled={selectedProfiles.length === 0}
            value={exportedText}
          />
        {/if}
      </div>
    </div>
    <div class="caption">Be careful about sharing sensitive data!</div>
  </Content>
  <div class="mdc-dialog__actions">
    <FormField>
      <Checkbox bind:checked={keepStyles} color="secondary" />
      <span slot="label">Export styles</span>
    </FormField>
    {#if activeTab.value === 'json'}
      {#if selectedProfiles.length === 0}
        <Button disabled>
          <MdiIcon size="24" icon={mdiDownload} color={DISABLED_COLOR} />
          <Label class="ml-small">Download JSON</Label>
        </Button>
      {:else}
        <Button
          href="data:application/json;base64,{encode(exportedText)}"
          download="{selectedProfiles.map((p) => p.title).join('+')}.json"
        >
          <MdiIcon size="24" icon={mdiDownload} color={PRIMARY_COLOR} />
          <Label class="ml-small">Download JSON</Label>
        </Button>
      {/if}
    {/if}
    {#if activeTab.value === 'url'}
      <Button disabled={selectedProfiles.length === 0} on:click={() => exportUrlTextbox.focus()}>
        <MdiIcon
          size="24"
          icon={mdiContentCopy}
          color={selectedProfiles.length === 0 ? DISABLED_COLOR : PRIMARY_COLOR}
        />
        <Label class="ml-small">Copy URL</Label>
      </Button>
    {/if}
  </div>
</Dialog>

<style module>
  .export-dialog-content {
    display: grid;
    grid-template-columns: auto 1px auto;
  }

  .export-dialog-content :global(.mdc-deprecated-list-item) {
    padding-left: 0;
  }

  .grid-border {
    border-left: 1px solid #888;
  }

  .export-text-field {
    width: 350px;
    font-size: 1rem;
  }
</style>
