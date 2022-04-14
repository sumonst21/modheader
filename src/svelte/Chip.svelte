<script context="module">
  import { mdiChevronDownCircle, mdiChevronRightCircle, mdiCloseCircle } from '@mdi/js';

  const TrailingAction = {
    TOGGLE: 'toggle',
    CLOSE: 'close',
    DROPDOWN: 'dropdown'
  };

  const TrailingActionConfigs = {
    [TrailingAction.TOGGLE]: {
      icon: mdiChevronRightCircle,
      dispatchAction: 'click'
    },
    [TrailingAction.CLOSE]: {
      icon: mdiCloseCircle,
      dispatchAction: 'close'
    },
    [TrailingAction.DROPDOWN]: {
      icon: mdiChevronDownCircle,
      dispatchAction: 'click'
    }
  };
</script>

<script>
  import Ripple from '@smui/ripple';
  import MdiIcon from './MdiIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  export let fieldName;
  export let trailingAction = TrailingAction.TOGGLE;
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
  {#if trailingAction !== TrailingAction.NONE}
    <button
      class="mdc-deprecated-chip-trailing-action"
      on:click={() => dispatch(TrailingActionConfigs[trailingAction].dispatchAction)}
    >
      <span class="mdc-deprecated-chip-trailing-action__icon">
        <MdiIcon icon={TrailingActionConfigs[trailingAction].icon} color="#888" size="18" />
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
