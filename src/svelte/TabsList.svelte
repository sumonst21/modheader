<script>
  import { mdiFileQuestion } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';

  const MAX_TABS = 8;

  export let tabs;
</script>

{#each tabs.slice(0, MAX_TABS) as tab}
  {#if tab.favIconUrl}
    <img src={tab.favIconUrl} class="vertical-align-text-bottom mx-1" width="18" height="18" />
  {:else}
    <MdiIcon
      class="vertical-align-text-bottom mx-1"
      icon={mdiFileQuestion}
      size="18"
      color="#888"
    />
  {/if}
{/each}
{#if tabs.length > MAX_TABS}
  <span class="regular-text">and {tabs.length - MAX_TABS} more...</span>
{/if}
