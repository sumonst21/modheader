<script>
  import Button from '@smui/button';
  import { buttonColor } from '../js/profile.js';
  import { isLocked } from '../js/datasource.js';
</script>

{#if $isLocked}
  <Button
    on:click={() => isLocked.set(false)}
    title={'Unlock tab'}
    style="height: inherit; min-width: fit-content; color: {$buttonColor}"
  >
    Unlock
  </Button>
{:else}
  <Button
    on:click={() => isLocked.set(true)}
    title={'Lock to tab'}
    style="height: inherit; min-width: fit-content; color: {$buttonColor}"
  >
    Lock tab
  </Button>
{/if}
