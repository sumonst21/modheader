<script>
  import { isProUser } from '../js/identity.js';
  import MdiIcon from './MdiIcon.svelte';
  import { mdiLock } from '@mdi/js';
  import { LOCK_COLOR } from '../js/color.js';
</script>

{#if !$isProUser}
  <MdiIcon class="ml-small" icon={mdiLock} size="16" color={LOCK_COLOR} />
{/if}
