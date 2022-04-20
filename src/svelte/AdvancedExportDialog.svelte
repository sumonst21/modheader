<script>
  import { encode } from 'js-base64';
  import Button, { Label } from '@smui/button';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import FormField from '@smui/form-field';
  import TabBar from '@smui/tab-bar';
  import Checkbox from '@smui/checkbox';
  import List, { Meta, Item, Label as ListLabel } from '@smui/list';
  import { mdiSelectAll, mdiDownload, mdiContentCopy } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import ExportTextfield from './ExportTextfield.svelte';
  import { DISABLED_COLOR, PRIMARY_COLOR } from '../js/constants.js';
  import { profiles } from '../js/datasource.js';
  import { showExportDialog } from '../js/dialog.js';
  import { selectedProfile, exportProfile } from '../js/profile.js';

  const TABS = [
    { label: 'URL', value: 'url' },
    { label: 'JSON', value: 'json' }
  ];
  let activeTab = TABS[0];
  let exportTextfield;
  let selectedProfiles = [];
  let keepStyles = false;

  showExportDialog.subscribe((show) => {
    if (show) {
      selectedProfiles = [$selectedProfile];
    }
  });
</script>

{#if $showExportDialog}
  <BaseDialog bind:open={$showExportDialog} title="Export / share selected profile(s)">
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
        <ExportTextfield {keepStyles} {selectedProfiles} mode={activeTab.value} />
      </div>
    </div>
    <div class="caption">Be careful about sharing sensitive data, e.g. auth token / cookies!</div>

    <svelte:fragment slot="footer">
      <FormField>
        <Checkbox bind:checked={keepStyles} color="secondary" />
        <span slot="label" class="clickable">Export styles</span>
      </FormField>
      {#if $profiles.length > 1}
        <Button on:click={() => (selectedProfiles = [...$profiles])}>
          <MdiIcon size="24" icon={mdiSelectAll} color={PRIMARY_COLOR} />
          <Label class="ml-small">Export all profiles</Label>
        </Button>
      {/if}
      {#if activeTab.value === 'json'}
        {#if selectedProfiles.length === 0}
          <Button disabled>
            <MdiIcon size="24" icon={mdiDownload} color={DISABLED_COLOR} />
            <Label class="ml-small">Download JSON</Label>
          </Button>
        {:else}
          <Button
            href="data:application/json;base64,{encode(
              exportProfile(selectedProfiles, { keepStyles })
            )}"
            download="{selectedProfiles.map((p) => p.title).join('+')}.json"
          >
            <MdiIcon size="24" icon={mdiDownload} color={PRIMARY_COLOR} />
            <Label class="ml-small">Download JSON</Label>
          </Button>
        {/if}
      {/if}
      {#if activeTab.value === 'url'}
        <Button disabled={selectedProfiles.length === 0} on:click={() => exportTextfield.focus()}>
          <MdiIcon
            size="24"
            icon={mdiContentCopy}
            color={selectedProfiles.length === 0 ? DISABLED_COLOR : PRIMARY_COLOR}
          />
          <Label class="ml-small">Copy URL</Label>
        </Button>
      {/if}
    </svelte:fragment>
  </BaseDialog>
{/if}

<style module>
  .export-dialog-content {
    display: grid;
    grid-template-columns: auto 1px auto;
  }

  .export-dialog-content :global(.mdc-deprecated-list-item) {
    padding-left: 0;
  }

  .export-dialog-content :global(.mdc-deprecated-list-item__meta) {
    margin-left: 0;
  }

  .grid-border {
    border-left: 1px solid #888;
  }
</style>
