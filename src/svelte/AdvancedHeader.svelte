<script>
  import Chip from './Chip.svelte';
  import { AppendMode } from '../js/append-mode.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function dispatchChange() {
    dispatch('change');
  }

  export let modifier;
</script>

{#if modifier.appendMode}
  <div class="advanced-header-row">
    <Chip
      fieldName="append-mode"
      on:click={() => {
        if (modifier.appendMode === AppendMode.APPEND) {
          modifier.appendMode = AppendMode.COMMA_SEPARATED_APPEND;
        } else {
          modifier.appendMode = AppendMode.APPEND;
        }
        dispatchChange();
      }}
      on:close={() => {
        delete modifier.appendMode;
        dispatchChange();
      }}
    >
      {modifier.appendMode === AppendMode.APPEND ? 'append value' : 'append with comma separated'}
    </Chip>
  </div>
{/if}

<style module>
  .advanced-header-row {
    margin-left: 32px;
  }
</style>
