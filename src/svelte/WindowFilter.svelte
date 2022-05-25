<script>
  import { tabs } from '@modheader/core';
  import Chip from './Chip.svelte';
  import TabsList from './TabsList.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let filter;

  async function useCurrentWindow() {
    const tab = await tabs.getActiveTab();
    filter.windowId = tab.windowId;
    dispatchChange();
  }

  function dispatchRemove() {
    dispatch('remove');
  }

  function dispatchChange() {
    dispatch('change');
  }
</script>

<div class="data-table-cell flex-grow inline-filter-row">
  {#await tabs.queryTabs({ windowId: filter.windowId }) then tabs}
    <Chip fieldName="window" tooltip="Filter by current window." on:click={useCurrentWindow}
      >Use current window</Chip
    >
    <TabsList {tabs} />
  {:catch error}
    <Chip on:click={dispatchRemove} on:close={dispatchRemove} trailingAction="close">
      Window no longer exists. Removed?
    </Chip>
  {/await}
</div>
