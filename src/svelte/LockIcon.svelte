<script>
  import MdiIcon from './MdiIcon.svelte';
  import { mdiLock } from '@mdi/js';
  import { color, identity } from '@modheader/core';

  const { isProUser } = identity;
</script>

{#if !$isProUser}
  <MdiIcon class="ml-small" icon={mdiLock} size="16" color={color.LOCK_COLOR} />
{/if}
