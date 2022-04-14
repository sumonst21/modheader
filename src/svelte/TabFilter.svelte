<script>
  import Button from '@smui/button';
  import { mdiClose, mdiFileQuestion } from '@mdi/js';
  import { getTab, queryTabs, getActiveTab } from '../js/tabs.js';
  import MdiIcon from './MdiIcon.svelte';
  import Chip from './Chip.svelte';
  import TabsList from './TabsList.svelte';
  import { createEventDispatcher } from 'svelte';

  const TAB_GROUP_ID_NONE = -1;
  const MAX_TITLE_LENGTH = 35;
  const dispatch = createEventDispatcher();
  export let filter;

  function shortTitle(title) {
    if (title.length > MAX_TITLE_LENGTH) {
      return title.slice(0, MAX_TITLE_LENGTH) + '...';
    }
    return title;
  }

  async function useCurrentTab() {
    const tab = await getActiveTab();
    filter.tabId = tab.id;
    delete filter.groupId;
    delete filter.windowId;
    dispatchChange();
  }

  function dispatchRemove() {
    dispatch('remove');
  }

  function dispatchChange() {
    dispatch('change');
  }
</script>

<div class="data-table-cell flex-grow">
  {#if filter.groupId}
    {#await queryTabs({ groupId: filter.groupId }) then tabs}
      <div class="regular-text">
        <Chip
          fieldName="tab-group"
          on:click={async () => {
            const tab = await getActiveTab();
            delete filter.groupId;
            filter.windowId = tab.windowId;
            dispatchChange();
          }}>Tab group</Chip
        >
        <TabsList {tabs} />
      </div>
    {:catch error}
      <Chip on:click={dispatchRemove} on:close={dispatchRemove} trailingAction="close">
        Tab group no longer exists. Removed?
      </Chip>
    {/await}
  {:else if filter.windowId}
    {#await queryTabs({ windowId: filter.windowId }) then tabs}
      <div class="regular-text">
        <Chip fieldName="window" on:click={useCurrentTab}>Window</Chip>
        <TabsList {tabs} />
      </div>
    {:catch error}
      <Chip on:click={dispatchRemove} on:close={dispatchRemove} trailingAction="close">
        Window no longer exists. Removed?
      </Chip>
    {/await}
  {:else if filter.tabId}
    {#await getTab(filter.tabId) then tab}
      <div class="regular-text">
        <Chip
          fieldName="single-tab"
          on:click={() => {
            delete filter.tabId;
            if (tab.groupId && tab.groupId !== TAB_GROUP_ID_NONE) {
              filter.groupId = tab.groupId;
            } else {
              filter.windowId = tab.windowId;
            }
            dispatchChange();
          }}
        >
          Single tab
        </Chip>
        {#if tab.favIconUrl}
          <img
            src={tab.favIconUrl}
            class="vertical-align-text-bottom mx-1"
            width="18"
            height="18"
            alt={tab.title}
          />
        {:else}
          <MdiIcon
            class="vertical-align-text-bottom"
            icon={mdiFileQuestion}
            size="18"
            color="#888"
          />
        {/if}
        {shortTitle(tab.title || tab.url || 'Unknown tab')}
      </div>
    {:catch error}
      <Chip on:click={dispatchRemove} on:close={dispatchRemove} trailingAction="close">
        Tab no longer exists. Removed?
      </Chip>
    {/await}
  {:else}
    <Button on:click={useCurrentTab}>By current tab</Button>
  {/if}
</div>
