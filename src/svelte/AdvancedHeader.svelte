<script>
  import Chip from './Chip.svelte';
  import { AppendMode } from '../js/append-mode.js';
  import { showMessage } from '../js/toast.js';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function dispatchChange() {
    dispatch('change');
  }

  export let modifier;
</script>

{#if modifier.appendMode || (modifier.name && !modifier.value)}
  <div class="advanced-header-row">
    {#if modifier.name && !modifier.value}
      <Chip
        fieldName="send-empty-header"
        tooltip={modifier.sendEmptyHeader
          ? 'Header will be replaced with empty value instead of removed. Click to change behavior'
          : 'Header will be removed if found. Enter a value to override header value. Click to change behavior'}
        on:click={() => {
          modifier.sendEmptyHeader = !modifier.sendEmptyHeader;
          showMessage(
            modifier.sendEmptyHeader
              ? `"${modifier.name}" header will be sent as empty value`
              : `"${modifier.name}" header will be removed if found`
          );
          dispatchChange();
        }}>Empty header: {modifier.sendEmptyHeader ? 'send empty value' : 'remove'}</Chip
      >
    {/if}
    {#if modifier.appendMode}
      <Chip
        fieldName="append-mode"
        trailingAction="close"
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
    {/if}
  </div>
{/if}

<style module>
  .advanced-header-row {
    margin-left: 32px;
  }
</style>
