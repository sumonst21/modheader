<script>
  import Button from '@smui/button';
  import { buttonColor } from '../js/profile';
  import { isLocked } from '../js/datasource';
</script>

{#if $isLocked}
  <Button
    on:click={() => isLocked.set(false)}
    title="Unlock tab"
    style="min-width: fit-content; color: {$buttonColor}"
  >
    Unlock
  </Button>
{:else}
  <Button
    on:click={() => isLocked.set(true)}
    title="Lock to tab"
    style="min-width: fit-content; color: {$buttonColor}"
  >
    Lock tab
  </Button>
{/if}
