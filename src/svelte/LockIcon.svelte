<script>
  import { isProUser } from '../js/identity.js';
  import MdiIcon from './MdiIcon.svelte';
  import { mdiLock } from '@mdi/js';
  import { color } from '@modheader/core';
</script>

{#if !$isProUser}
  <MdiIcon class="ml-small" icon={mdiLock} size="16" color={color.LOCK_COLOR} />
{/if}
