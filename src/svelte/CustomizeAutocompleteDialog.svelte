<script>
  import { get } from 'svelte/store';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import BaseDialog from './BaseDialog.svelte';
  import { selectedProfile, updateProfile } from '../js/profile.js';

  export let modifierHandler;
  let dialogVisible;
  let autocompleteName = '';
  let autocompleteValue = '';
  let needSaving = false;

  export function open() {
    const profile = get(selectedProfile);
    const autocompleteConfig = profile[modifierHandler.customAutocompleteFieldName];
    if (autocompleteConfig) {
      autocompleteName = autocompleteConfig.autocompleteName.join('\n');
      autocompleteValue = autocompleteConfig.autocompleteValue.join('\n');
    }
    if (!autocompleteName) {
      autocompleteName = '';
    }
    if (!autocompleteValue) {
      autocompleteValue = '';
    }
    dialogVisible = true;
    needSaving = true;
  }

  function saveConfiguration() {
    if (!needSaving) {
      return;
    }
    updateProfile({
      [modifierHandler.customAutocompleteFieldName]: {
        autocompleteName: autocompleteName
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0),
        autocompleteValue: autocompleteValue
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.length > 0)
      }
    });
    needSaving = false;
  }

  $: !dialogVisible && saveConfiguration();
</script>

{#if dialogVisible}
  <BaseDialog bind:open={dialogVisible} title="Customize autocomplete">
    <div class="autocomplete-dialog-content">
      <div>
        Enter the entries that you would like to show up in autocomplete. These autocomplete entries
        will show up when you focus on an input and as you type.
      </div>
      <Textfield
        textarea
        fullwidth
        class="dialog-textfield"
        bind:value={autocompleteName}
        label="{modifierHandler.nameLabel} - One entry per line"
      />
      <Textfield
        textarea
        fullwidth
        class="dialog-textfield"
        bind:value={autocompleteValue}
        label="{modifierHandler.valueLabel} - One entry per line"
      />
    </div>
    <svelte:fragment slot="footer">
      <Button on:click={() => (dialogVisible = false)}>
        <Label>Done</Label>
      </Button>
    </svelte:fragment>
  </BaseDialog>
{/if}

<style module>
  .autocomplete-dialog-content {
    padding-top: 5px;
  }

  .dialog-textfield {
    margin: 5px;
    width: 90%;
  }
</style>
