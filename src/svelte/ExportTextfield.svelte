<script>
  import LinearProgress from '@smui/linear-progress';
  import Textfield from '@smui/textfield';
  import { showMessage } from '../js/toast.js';
  import { exportProfiles } from '../js/profile.js';
  import { createProfile, updateProfile } from '../js/api.js';

  export let selectedProfiles;
  export let keepStyles;
  export let mode = 'url';
  let exportUrlTextbox;
  let exportJsonTextbox;
  let uploadedExportProfiles;

  let exportUrl = '';
  let exportProfileId;
  let uploading;

  export function focus() {
    if (mode === 'url') {
      exportUrlTextbox.focus();
    } else {
      exportJsonTextbox.focus();
    }
  }

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

  async function createProfileUrl() {
    uploadedExportProfiles = exportProfiles(selectedProfiles, { keepStyles });
    const { profileId } = await createProfile({ profiles: uploadedExportProfiles });
    exportProfileId = profileId;
    exportUrl = `${process.env.URL_BASE}/profile/v2/${profileId}`;
  }

  $: {
    const newUploadedExportProfiles = exportProfiles(selectedProfiles, { keepStyles });
    if (exportProfileId && uploadedExportProfiles !== newUploadedExportProfiles) {
      uploadedExportProfiles = newUploadedExportProfiles;
      uploading = true;
      updateProfile({
        profileId: exportProfileId,
        profiles: uploadedExportProfiles
      })
        .catch(() => {
          showMessage('Failed to update exported profiles');
        })
        .finally(() => {
          uploading = false;
        });
    }
  }

  $: exportedText =
    selectedProfiles.length > 0
      ? exportProfiles(selectedProfiles, { keepStyles })
      : 'Select a profile to export';
</script>

{#if mode === 'url'}
  {#await createProfileUrl()}
    <div>Generating export URL</div>
  {:then done}
    <Textfield
      bind:this={exportUrlTextbox}
      on:focus={() => copyExportText(exportUrlTextbox, exportUrl)}
      class="export-text-field"
      type="url"
      input$rows="5"
      textarea
      readonly
      disabled={selectedProfiles.length === 0}
      value={exportUrl}
    />
    {#if uploading}
      <LinearProgress indeterminate />
    {/if}
  {:catch err}
    <div class="error-text">Failed to generate export URL</div>
  {/await}
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

<style module>
  .export-text-field {
    width: 380px;
    font-size: 1rem;
  }
</style>
