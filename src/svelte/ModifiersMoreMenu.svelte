<script>
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Separator, Text } from '@smui/list';
  import {
    mdiPlus,
    mdiTrashCanOutline,
    mdiSortAlphabeticalAscending,
    mdiSortAlphabeticalDescending,
    mdiDotsVertical
  } from '@mdi/js';
  import lodashOrderBy from 'lodash/orderBy.js';
  import { selectedProfile } from '../js/profile.js';
  import MdiIcon from './MdiIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let modifierHandler;
  export let modifiers;
  let moreMenu;

  function dispatchRefresh() {
    dispatch('refresh', modifiers);
  }

  function sort(field, order) {
    modifiers = lodashOrderBy(modifiers, [field], [order]);
    dispatchRefresh();
  }
</script>

<IconButton
  aria-label="More menu"
  class="medium-icon-button data-table-cell flex-fixed-icon"
  on:click={() => moreMenu.setOpen(true)}
>
  <MdiIcon size="32" color="#666" icon={mdiDotsVertical} />
</IconButton>

<Menu bind:this={moreMenu}>
  <List>
    <Item on:SMUI:action={() => modifierHandler.addHandler()}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiPlus} color="#666" />
      <Text>Add</Text>
    </Item>
    <Item
      on:SMUI:action={() => {
        modifiers = [];
        dispatchRefresh();
      }}
    >
      <MdiIcon class="more-menu-icon" size="24" icon={mdiTrashCanOutline} color="#666" />
      <Text>Clear all</Text>
    </Item>
    <Separator nav />
    <Item on:SMUI:action={() => sort('name', 'asc')}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiSortAlphabeticalAscending} color="#666" />
      <Text>{modifierHandler.nameLabel} - ascending</Text>
    </Item>
    <Item on:SMUI:action={() => sort('name', 'desc')}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiSortAlphabeticalDescending} color="#666" />
      <Text>{modifierHandler.nameLabel} - descending</Text>
    </Item>
    <Item on:SMUI:action={() => sort('value', 'asc')}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiSortAlphabeticalAscending} color="#666" />
      <Text>{modifierHandler.valueLabel} - ascending</Text>
    </Item>
    <Item on:SMUI:action={() => sort('value', 'desc')}>
      <MdiIcon class="more-menu-icon" size="24" icon={mdiSortAlphabeticalDescending} color="#666" />
      <Text>{modifierHandler.valueLabel} - descending</Text>
    </Item>
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
