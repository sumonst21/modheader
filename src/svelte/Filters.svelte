<script>
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import {
    mdiPlus,
    mdiClose,
    mdiTrashCanOutline,
    mdiSortAlphabeticalAscending,
    mdiSortAlphabeticalDescending,
    mdiDotsVertical
  } from '@mdi/js';
  import lodashOrderBy from 'lodash/orderBy.js';
  import lodashDebounce from 'lodash/debounce.js';
  import { selectedProfile, updateProfile } from '../js/profile.js';
  import { FilterType, addUrlFilter, addResourceFilter, removeFilter } from '../js/filter.js';
  import AutoComplete from './Autocomplete.svelte';
  import MdiIcon from './MdiIcon.svelte';
  import TabFilter from './TabFilter.svelte';
  import ResourceTypeMenu from './ResourceTypeMenu.svelte';

  const FILTER_TYPES = {
    [FilterType.TABS]: {
      label: 'Tab filters',
      profileFieldName: 'tabFilters'
    },
    [FilterType.URLS]: {
      label: 'URL patterns',
      profileFieldName: 'urlFilters'
    },
    [FilterType.EXCLUDE_URLS]: {
      label: 'Exclude URL patterns',
      profileFieldName: 'excludeUrlFilters'
    },
    [FilterType.RESOURCE_TYPES]: {
      label: 'Resource types',
      profileFieldName: 'resourceFilters'
    }
  };

  export let id;
  export let profileIndex;
  export let filters;
  export let filterType;
  let sortMenu;
  let clazz;
  let resourceTypeMenuLocation;
  export { clazz as class };

  let allChecked;
  let allUnchecked;

  function sort(field, order) {
    filters = lodashOrderBy(filters, [field], [order]);
    refreshFilters();
  }

  function add(filters) {
    if (filterType === FilterType.URLS || filterType === FilterType.EXCLUDE_URLS) {
      return addUrlFilter(filters);
    } else {
      return addResourceFilter(filters);
    }
  }

  function toggleAll() {
    if (!allChecked) {
      filters.forEach((f) => (f.enabled = true));
    } else {
      filters.forEach((f) => (f.enabled = false));
    }
    refreshFilters();
  }

  function refreshFilters() {
    updateProfile({ [FILTER_TYPES[filterType].profileFieldName]: filters }, profileIndex);
  }

  const refreshFiltersDebounce = lodashDebounce(
    () => {
      refreshFilters();
      allChecked = filters.every((f) => f.enabled);
      allUnchecked = filters.every((f) => !f.enabled);
    },
    500,
    { leading: true, trailing: true }
  );
  $: filters, refreshFiltersDebounce();

  selectedProfile.subscribe(() => {
    refreshFiltersDebounce.cancel();
  });
</script>

{#if filters.length > 0}
  <div class="data-table {clazz}" {id}>
    <div class="data-table-row data-table-title-row">
      <Checkbox
        class="data-table-cell flex-fixed-icon"
        bind:checked={allChecked}
        indeterminate={!allChecked && !allUnchecked}
        on:click={toggleAll}
        disabled={filters.length === 0}
      />
      <h3 class="data-table-title data-table-cell flex-grow">{FILTER_TYPES[filterType].label}</h3>
      <div class="data-table-cell">
        <IconButton
          aria-label="Expand"
          class="medium-icon-button data-table-cell flex-fixed-icon"
          on:click={() => sortMenu.setOpen(true)}
        >
          <MdiIcon size="32" color="#666" icon={mdiDotsVertical} />
        </IconButton>

        <Menu bind:this={sortMenu}>
          <List>
            <Item
              on:SMUI:action={async () =>
                updateProfile({ [FILTER_TYPES[filterType].profileFieldName]: await add(filters) })}
            >
              <MdiIcon class="more-menu-icon" size="24" icon={mdiPlus} color="#666" />
              <Text>Add</Text>
            </Item>
            <Item
              on:SMUI:action={() =>
                updateProfile({ [FILTER_TYPES[filterType].profileFieldName]: [] })}
            >
              <MdiIcon class="more-menu-icon" size="24" icon={mdiTrashCanOutline} color="#666" />
              <Text>Clear all</Text>
            </Item>
            <Separator nav />
            {#if filterType === FilterType.RESOURCE_TYPES}
              <Item on:SMUI:action={() => sort('type', 'asc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalAscending}
                  color="#666"
                />
                <Text>Type - ascending</Text>
              </Item>
              <Item on:SMUI:action={() => sort('type', 'desc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalDescending}
                  color="#666"
                />
                <Text>Type - descending</Text>
              </Item>
            {/if}
            {#if filterType === FilterType.URLS || filterType === FilterType.EXCLUDE_URLS}
              <Item on:SMUI:action={() => sort('urlRegex', 'asc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalAscending}
                  color="#666"
                />
                <Text>URL regex - ascending</Text>
              </Item>
              <Item on:SMUI:action={() => sort('urlRegex', 'desc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalDescending}
                  color="#666"
                />
                <Text>URL regex - descending</Text>
              </Item>
            {/if}
            {#if !$selectedProfile.hideComment}
              <Item on:SMUI:action={() => sort('comment', 'asc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalAscending}
                  color="#666"
                />
                <Text>Comment - ascending</Text>
              </Item>
              <Item on:SMUI:action={() => sort('comment', 'desc')}>
                <MdiIcon
                  class="more-menu-icon"
                  size="24"
                  icon={mdiSortAlphabeticalDescending}
                  color="#666"
                />
                <Text>Comment - descending</Text>
              </Item>
            {/if}
          </List>
        </Menu>
      </div>
    </div>
    {#each filters as filter, filterIndex}
      <div class="data-table-row {filter.enabled ? '' : 'data-table-row-unchecked'}">
        <Checkbox
          bind:checked={filter.enabled}
          indeterminate={false}
          on:change={refreshFilters}
          class="data-table-cell flex-fixed-icon"
        />
        {#if filterType === FilterType.URLS || filterType === FilterType.EXCLUDE_URLS}
          <AutoComplete
            name="url-regex"
            bind:value={filter.urlRegex}
            placeholder=".*://.*.google.com/.*"
          />
        {:else if filterType === FilterType.RESOURCE_TYPES}
          <ResourceTypeMenu bind:resourceType={filter.resourceType} {resourceTypeMenuLocation} />
        {:else if filterType === FilterType.TABS}
          <TabFilter
            {filter}
            on:change={refreshFilters}
            on:remove={() =>
              updateProfile({
                [FILTER_TYPES[filterType].profileFieldName]: removeFilter(filters, filterIndex)
              })}
          />
        {/if}
        {#if !$selectedProfile.hideComment}
          <AutoComplete bind:value={filter.comment} placeholder="Comment" />
        {/if}
        <IconButton
          dense
          aria-label="Delete"
          class="small-icon-button data-table-cell flex-fixed-icon"
          on:click={() =>
            updateProfile({
              [FILTER_TYPES[filterType].profileFieldName]: removeFilter(filters, filterIndex)
            })}
        >
          <MdiIcon size="24" icon={mdiClose} color="red" />
        </IconButton>
      </div>
    {/each}
  </div>
{/if}
