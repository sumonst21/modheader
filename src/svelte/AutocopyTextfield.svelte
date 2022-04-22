<script>
  import LinearProgress from '@smui/linear-progress';
  import Textfield from '@smui/textfield';
  import { showMessage } from '../js/toast.js';

  export let value;
  export let updating;

  let textfield;

  export function focus() {
    textfield.focus();
  }

  async function copyExportText(content) {
    textfield.getElement().querySelector('textarea').select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content);
    } else {
      document.execCommand('copy');
    }
    showMessage('Copied to clipboard!');
  }
</script>

<Textfield
  bind:this={textfield}
  on:focus={() => copyExportText(value)}
  class="export-text-field"
  type="url"
  input$rows="5"
  textarea
  readonly
  disabled={updating}
  {value}
/>
{#if updating}
  <LinearProgress indeterminate />
{/if}
