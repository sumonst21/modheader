<script>
  import MdiIcon from './MdiIcon.svelte';
  import { mdiAccountCircle } from '@mdi/js';

  export let picture;
  export let size = 48;
</script>

{#if picture}
  <img
    src={picture}
    style="border-radius: 50%"
    width={size}
    height={size}
    alt=""
  />
{:else}
  <MdiIcon icon={mdiAccountCircle} {size} color="white" />
{/if}
