<script>
  import Button from '@smui/button';
  import ProFeature from './ProFeature.svelte';
  import { buttonColor } from '../js/profile.js';
  import { isLocked } from '../js/datasource.js';
</script>

<ProFeature let:upgradeRequired>
  {#if $isLocked}
    <Button
      on:click={() => isLocked.set(false)}
      title={upgradeRequired ? 'Unlock tab - Upgrade to Pro required' : 'Unlock tab'}
      style="height: inherit; min-width: fit-content; color: {$buttonColor}"
    >
      Unlock
    </Button>
  {:else}
    <Button
      on:click={() => isLocked.set(true)}
      title={upgradeRequired ? 'Unlock tab - Upgrade to Pro required' : 'Lock to tab'}
      style="height: inherit; min-width: fit-content; color: {$buttonColor}"
    >
      Lock tab
    </Button>
  {/if}
</ProFeature>
