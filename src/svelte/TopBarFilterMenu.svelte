<script>
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import IconButton from '@smui/icon-button';
  import { mdiFilter } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { selectedProfile, updateProfile, buttonColor } from '../js/profile.js';
  import { addUrlFilter, addResourceFilter, addTabFilter } from '../js/filter.js';

  let filterMenu;
</script>

<div>
  <IconButton dense on:click={() => filterMenu.setOpen(true)} title="Filter" id="filter-button">
    <MdiIcon size="24" icon={mdiFilter} color={$buttonColor} />
  </IconButton>
  <Menu bind:this={filterMenu} class="filter-menu">
    <List>
      <Item
        id="add-tab-filter"
        on:SMUI:action={async () =>
          updateProfile({
            tabFilters: await addTabFilter($selectedProfile.tabFilters)
          })}>Tab Filter</Item
      >
      <Item
        id="add-url-filter"
        on:SMUI:action={async () =>
          updateProfile({
            urlFilters: await addUrlFilter($selectedProfile.urlFilters)
          })}>URL Filter</Item
      >
      <Item
        id="add-exclude-url-filter"
        on:SMUI:action={async () =>
          updateProfile({
            excludeUrlFilters: await addUrlFilter($selectedProfile.excludeUrlFilters)
          })}>Exclude URL Filter</Item
      >
      <Item
        id="add-resource-filter"
        on:SMUI:action={async () =>
          updateProfile({
            resourceFilters: await addResourceFilter($selectedProfile.resourceFilters)
          })}>Resource Filter</Item
      >
    </List>
  </Menu>
</div>

<style module>
  .filter-menu {
    width: 250px;
  }
</style>
