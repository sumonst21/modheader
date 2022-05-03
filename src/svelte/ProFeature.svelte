<script>
  import MdiIcon from './MdiIcon.svelte';
  import { isProUser } from '../js/identity.js';
  import { mdiLock } from '@mdi/js';
  import { showUpgradeDialog } from '../js/dialog.js';
  import { LOCK_COLOR } from '../js/color.js';

  export let requirePro = true;

  function showUpgrade() {
    showUpgradeDialog.set(true);
  }
</script>

{#if !requirePro || $isProUser}
  <div class="pro-feature-container">
    <slot upgradeRequired={false} />
  </div>
{:else}
  <div class="pro-feature-container" on:click|capture|preventDefault|stopPropagation={showUpgrade}>
    <slot upgradeRequired={true} />
    <MdiIcon class="pro-feature-lock" icon={mdiLock} size="12" color={LOCK_COLOR} />
  </div>
{/if}

<style module>
  .pro-feature-container {
    cursor: pointer;
    position: relative;
    display: inline-block;
    height: 100%;
  }

  .pro-feature-lock {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 12px !important;
    height: 12px !important;
  }
</style>
