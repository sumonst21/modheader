<script>
  import Ripple from '@smui/ripple';
  import MdiIcon from './MdiIcon.svelte';
  import { mdiCloseCircle } from '@mdi/js';
  import { createEventDispatcher } from 'svelte';

  export let fieldName;
  export let showCloseButton = true;
  const dispatch = createEventDispatcher();
</script>

<div
  class="mdc-chip small-chip"
  role="row"
  use:Ripple={{ surface: true }}
  data-field-name={fieldName}
>
  <span role="gridcell">
    <span
      class="mdc-chip__primary-action"
      role="button"
      tabindex="0"
      on:click={() => dispatch('click')}
    >
      <span class="mdc-chip__text"><slot /></span>
    </span>
  </span>
  {#if showCloseButton}
    <button class="mdc-deprecated-chip-trailing-action" on:click={() => dispatch('close')}>
      <span class="mdc-deprecated-chip-trailing-action__icon">
        <MdiIcon icon={mdiCloseCircle} color="#888" size="18" />
      </span>
    </button>
  {/if}
</div>

<style module>
  .small-chip {
    height: 24px;
    margin: 2px;
  }
</style>
