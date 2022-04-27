<script>
  import Button, { Label } from '@smui/button';
  import { mdiContentCopy, mdiLock } from '@mdi/js';
  import lodashIsEqual from 'lodash/isEqual';
  import MdiIcon from './MdiIcon.svelte';
  import BaseDialog from './BaseDialog.svelte';
  import AutocopyTextfield from './AutocopyTextfield.svelte';
  import { PRIMARY_COLOR } from '../js/constants.js';
  import { showExportDialog } from '../js/dialog.js';
  import { openUrl } from '../js/tabs.js';
  import { Visibility } from '../js/visibility.js';
  import { selectedProfile, exportProfile, updateProfile } from '../js/profile.js';
  import {
    getProfile as getProfileApi,
    createProfile as createProfileApi,
    getProfileUrl,
    updateProfile as updateProfileApi
  } from '../js/api.js';
  import { showMessage } from '../js/toast.js';

  let exportTextfield;
  let allowedEmails = [];
  let visibility = Visibility.restricted.value;
  let showOverrideDialog;
  const keepStyles = true;

  let exportUrl = '';
  let uploading;

  showExportDialog.subscribe(async (isShown) => {
    if (isShown) {
      await onDialogShown();
    }
  });

  async function onDialogShown() {
    exportUrl = 'Generating export URL';
    uploading = true;
    if ($selectedProfile.profileId) {
      try {
        const profileResponse = await getProfileApi({ profileId: $selectedProfile.profileId });
        exportUrl = getProfileUrl({ profileId: $selectedProfile.profileId });
        if (
          !lodashIsEqual(profileResponse.profile, exportProfile($selectedProfile, { keepStyles }))
        ) {
          showOverrideDialog = true;
        }
        uploading = false;
        return;
      } catch (err) {
        if (err.statusCode !== 404) {
          exportUrl = 'Failed to retrieve profile from URL. Please try again later.';
          uploading = false;
          return;
        }
      }
    }
    try {
      const { profileId } = await createProfileApi({
        profile: exportProfile($selectedProfile, { keepStyles })
      });
      updateProfile({ profileId });
      exportUrl = getProfileUrl({ profileId: $selectedProfile.profileId });
    } catch (err) {
      exportUrl = 'Failed to generate export URL';
    } finally {
      uploading = false;
    }
    await createProfileUrl();
  }

  async function createProfileUrl() {
    try {
      const { profileId } = await createProfileApi({
        profile: exportProfile($selectedProfile, { keepStyles })
      });
      updateProfile({ profileId });
      exportUrl = getProfileUrl({ profileId: $selectedProfile.profileId });
    } catch (err) {
      exportUrl = 'Failed to generate export URL';
    } finally {
      uploading = false;
    }
  }

  async function updateExportProfile() {
    uploading = true;
    try {
      await updateProfileApi({
        profileId: $selectedProfile.profileId,
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
      <AutocopyTextfield value={exportUrl} updating={uploading} numRows={2} />

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
      <Button
        on:click={() => openUrl({ url: exportUrl, params: { action: 'share' } })}
        variant="raised"
      >
        <MdiIcon size="24" icon={mdiLock} color='#fff' />
        <Label class="ml-small">Change visibility</Label>
      </Button>
      <Button on:click={() => exportTextfield.focus()} variant="raised">
        <MdiIcon size="24" icon={mdiContentCopy} color='#fff' />
        <Label class="ml-small">Copy URL</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>

  <BaseDialog bind:open={showOverrideDialog} title="Override existing profile?">
    <div class="export-dialog-content">
      <div>
        This profile has already been exported to {exportUrl}. Would you like to create a new
        shareable URL, or override the existing one?
      </div>

      <div>
        <Button on:click={() => openUrl({ url: exportUrl })}>
          <Label class="ml-small">View existing profile</Label>
        </Button>
      </div>
    </div>
    <svelte:fragment slot="footer">
      <Button
        variant="raised"
        on:click={async () => {
          showOverrideDialog = false;
          await createProfileUrl();
        }}
      >
        <Label>Create new URL</Label>
      </Button>
      <Button
        variant="raised"
        on:click={async () => {
          showOverrideDialog = false;
          await updateExportProfile();
        }}
      >
        <Label>Override profile</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}
