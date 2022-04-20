<script>
  import LinearProgress from '@smui/linear-progress';
  import Textfield from '@smui/textfield';
  import { showMessage } from '../js/toast.js';
  import { exportProfiles } from '../js/profile.js';

  export let selectedProfiles;
  export let keepStyles;
  export let mode = 'url';
  export let exportUrl = '';
  export let uploading;

  let exportUrlTextbox;
  let exportJsonTextbox;

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

  $: exportedText =
    selectedProfiles.length > 0
      ? exportProfiles(selectedProfiles, { keepStyles })
      : 'Select a profile to export';
</script>

{#if mode === 'url'}
  <Textfield
    bind:this={exportUrlTextbox}
    on:focus={() => copyExportText(exportUrlTextbox, exportUrl)}
    class="export-text-field"
    type="url"
    input$rows="5"
    textarea
    readonly
    disabled={selectedProfiles.length === 0 || uploading}
    value={exportUrl}
  />
  {#if uploading}
    <LinearProgress indeterminate />
  {/if}
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
