<script>
  import { mdiLock } from '@mdi/js';
  import { color, identity, MdiIcon } from '@modheader/core';

  const { isProUser } = identity;
</script>

{#if !$isProUser}
  <MdiIcon class="ml-small" icon={mdiLock} size="16" color={color.LOCK_COLOR} />
{/if}
