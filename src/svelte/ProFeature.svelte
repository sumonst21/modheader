<script>
  import MdiIcon from './MdiIcon.svelte';
  import { isProUser } from '../js/identity.js';
  import { mdiLock } from '@mdi/js';
  import { showUpgradeDialog } from '../js/dialog.js';

  function showUpgrade() {
    showUpgradeDialog.set(true);
  }
</script>

{#if $isProUser}
  <div class="pro-feature-container">
    <slot />
  </div>
{:else}
  <div class="pro-feature-container" on:click|capture|preventDefault|stopPropagation={showUpgrade}>
    <slot />
    <MdiIcon class="pro-feature-lock" icon={mdiLock} size="12" color="#e6a900" />
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
