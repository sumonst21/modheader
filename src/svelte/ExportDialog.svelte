<script>
  import { encode } from 'js-base64';
  import Button, { Label } from '@smui/button';
  import Tab, { Label as TabLabel } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import { mdiDownload, mdiContentCopy, mdiEye } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import VisibilityDialog from './VisibilityDialog.svelte';
  import ExportTextfield from './ExportTextfield.svelte';
  import { PRIMARY_COLOR } from '../js/constants.js';
  import { showExportDialog } from '../js/dialog.js';
  import { Visibility } from '../js/visibility.js';
  import { selectedProfile, exportProfile } from '../js/profile.js';
  import { createProfile, updateProfile } from '../js/api.js';
  import { showMessage } from '../js/toast.js';

  const TABS = [
    { label: 'URL', value: 'url' },
    { label: 'JSON', value: 'json' }
  ];

  let activeTab = TABS[0];
  let exportTextfield;
  let allowedEmails = [];
  let visibility = Visibility.restricted.value;
  let visibilityDialog;
  const keepStyles = true;

  let exportUrl;
  let exportProfileId;
  let uploading;

  showExportDialog.subscribe(async (isShown) => {
    if (isShown) {
      await createProfileUrl();
    }
  });

  async function createProfileUrl() {
    exportUrl = 'Generating export URL';
    uploading = true;
    try {
      const { profileId } = await createProfile({
        profile: exportProfile($selectedProfile, { keepStyles })
      });
      exportProfileId = profileId;
      exportUrl = `${process.env.URL_BASE}/profile/${profileId}`;
    } catch (err) {
      exportUrl = 'Failed to generate export URL';
    } finally {
      uploading = false;
    }
  }

  async function updateExportProfile() {
    uploading = true;
    try {
      await updateProfile({
        profileId: exportProfileId,
        profile: exportProfile($selectedProfile, { keepStyles }),
        visibility,
        allowedEmails
      });
    } catch (err) {
      showMessage('Failed to update exported profiles');
    } finally {
      uploading = false;
    }
  }
</script>

{#if $showExportDialog}
  <BaseDialog bind:open={$showExportDialog} title="Share with people">
    <div class="export-dialog-content">
      <TabBar tabs={TABS} let:tab bind:active={activeTab}>
        <Tab {tab}>
          <TabLabel>{tab.label}</TabLabel>
        </Tab>
      </TabBar>

      <ExportTextfield
        {keepStyles}
        profile={$selectedProfile}
        mode={activeTab.value}
        {exportUrl}
        {uploading}
      />

      <Button on:click={() => visibilityDialog.show(allowedEmails)}>
        <MdiIcon size="24" icon={mdiEye} color={PRIMARY_COLOR} />
        <Label class="ml-small">Visibility: {Visibility[visibility].label}</Label>
      </Button>
      <div class="caption">
        {#if visibility === Visibility.restricted.value}
          {#if allowedEmails.length === 0}
            Visible only to you
          {:else if allowedEmails.length === 1}
            Visible only to you and {allowedEmails[0]}
          {:else if allowedEmails.length === 2}
            Visible to you, {allowedEmails[0]}, and {allowedEmails[1]}
          {:else}
            Visible to you, {allowedEmails[0]}, and {allowedEmails.length - 1} other users.
          {/if}
        {:else}
          {Visibility[visibility].description}
        {/if}
      </div>
    </div>
    <svelte:fragment slot="footer">
      {#if activeTab.value === 'json'}
        <Button
          href="data:application/json;base64,{encode(
            JSON.stringify(exportProfile($selectedProfile, { keepStyles }))
          )}"
          download="{$selectedProfile.title}.json"
        >
          <MdiIcon size="24" icon={mdiDownload} color={PRIMARY_COLOR} />
          <Label class="ml-small">Download JSON</Label>
        </Button>
      {/if}
      {#if activeTab.value === 'url'}
        <Button on:click={() => exportTextfield.focus()}>
          <MdiIcon size="24" icon={mdiContentCopy} color={PRIMARY_COLOR} />
          <Label class="ml-small">Copy URL</Label>
        </Button>
      {/if}
    </svelte:fragment>
  </BaseDialog>
{/if}

<VisibilityDialog
  bind:this={visibilityDialog}
  {visibility}
  on:save={async (event) => {
    console.log('Updated visibility', event.detail);
    allowedEmails = event.detail.allowedEmails;
    visibility = event.detail.visibility;
    await updateExportProfile();
  }}
/>
