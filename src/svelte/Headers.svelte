<script>
  import IconButton from "@smui/icon-button";
  import Checkbox from "@smui/checkbox";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import {
    mdiPlus,
    mdiClose,
    mdiTrashCanOutline,
    mdiArrowExpand,
    mdiSortAlphabeticalAscending,
    mdiSortAlphabeticalDescending,
    mdiDotsVertical
  } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import lodashOrderBy from "lodash/orderBy";
  import lodashClone from "lodash/clone";
  import lodashDebounce from "lodash/debounce";
  import { fly } from 'svelte/transition';
  import { selectedProfile } from "../js/datasource";
  import AutoComplete from "./Autocomplete.svelte";
  import MdiIcon from "./MdiIcon.svelte";
  import ExpandHeaderDialog from './ExpandHeaderDialog.svelte';

  const dispatch = createEventDispatcher();

  export let headers;
  export let title;
  export let autocompleteListId;
  export let autocompleteNames;
  export let nameLabel = "Name";
  export let valueLabel = "Value";
  let selectedHeaderIndex;
  let selectedHeader;
  let dialog;
  let moreMenu;
  let clazz;
  export { clazz as class };

  let allChecked;
  let allUnchecked;

  function addHeader() {
    dispatch("add");
  }

  function removeHeader(headerIndex) {
    dispatch("remove", headerIndex);
  }

  function expandEditor(headerIndex) {
    selectedHeaderIndex = headerIndex;
    selectedHeader = lodashClone(headers[selectedHeaderIndex]);
    dialog.open();
  }

  function sort(field, order) {
    headers = lodashOrderBy(headers, [field], [order]);
    refreshHeaders();
  }

  function refreshHeaders() {
    dispatch("refresh", headers);
    allChecked = headers.every(h => h.enabled);
    allUnchecked = headers.every(h => !h.enabled);
  }

  function toggleAll() {
    if (!allChecked) {
      headers.forEach(h => (h.enabled = true));
    } else {
      headers.forEach(h => (h.enabled = false));
    }
    refreshHeaders();
  }

  const refreshHeadersDebounce = lodashDebounce(refreshHeaders, 500, { leading: true, trailing: true });
  $: headers, refreshHeadersDebounce();

  selectedProfile.subscribe(() => {
    refreshHeadersDebounce.cancel();
  });
</script>

{#if autocompleteListId && autocompleteNames}
  <datalist id={autocompleteListId}>
    {#each autocompleteNames as item}
      <option value={item}>
    {/each}
  </datalist>
{/if}

<ExpandHeaderDialog
  bind:this={dialog}
  {title}
  {nameLabel}
  {valueLabel}
  {selectedHeader}
  on:save={event => {
    headers[selectedHeaderIndex] = event.detail;
    refreshHeaders();
  }} />

<div class="data-table {clazz}" transition:fly>
  <div class="data-table-row data-table-title-row">
    <Checkbox
      class="data-table-cell flex-fixed-icon"
      bind:checked={allChecked}
      indeterminate={!allChecked && !allUnchecked}
      on:click={() => toggleAll()}
      disabled={headers.length === 0} />
    <h3 class="data-table-title data-table-cell flex-grow">{title}</h3>
    <div class="data-table-cell">
      
    </div>
    <div class="data-table-cell">
      <IconButton
        aria-label="Expand"
        class="medium-icon-button data-table-cell flex-fixed-icon"
        on:click={() => moreMenu.setOpen(true)}>
        <MdiIcon size="32" color="#666" icon={mdiDotsVertical} />
      </IconButton>
      
      <Menu bind:this={moreMenu} anchorCorner="TOP_LEFT" quickOpen>
        <List>
          <Item on:SMUI:action={() => addHeader(headers)}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiPlus}
              color="#666" />
            <Text>Add</Text>
          </Item>
          <Item on:SMUI:action={() => {
              headers = [];
              refreshHeaders();
            }}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiTrashCanOutline}
              color="#666" />
            <Text>Clear all</Text>
          </Item>
          <Separator nav />
          <Item on:SMUI:action={() => sort('name', 'asc')}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiSortAlphabeticalAscending}
              color="#666" />
            <Text>{nameLabel} - ascending</Text>
          </Item>
          <Item on:SMUI:action={() => sort('name', 'desc')}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiSortAlphabeticalDescending}
              color="#666" />
            <Text>{nameLabel} - descending</Text>
          </Item>
          <Item on:SMUI:action={() => sort('value', 'asc')}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiSortAlphabeticalAscending}
              color="#666" />
            <Text>{valueLabel} - ascending</Text>
          </Item>
          <Item on:SMUI:action={() => sort('value', 'desc')}>
            <MdiIcon
              class="more-menu-icon"
              size="24"
              icon={mdiSortAlphabeticalDescending}
              color="#666" />
            <Text>{valueLabel} - descending</Text>
          </Item>
          {#if !$selectedProfile.hideComment}
            <Item on:SMUI:action={() => sort('comment', 'asc')}>
              <MdiIcon
                class="more-menu-icon"
                size="24"
                icon={mdiSortAlphabeticalAscending}
                color="#666" />
              <Text>Comment - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('comment', 'desc')}>
              <MdiIcon
                class="more-menu-icon"
                size="24"
                icon={mdiSortAlphabeticalDescending}
                color="#666" />
              <Text>Comment - descending</Text>
            </Item>
          {/if}
        </List>
      </Menu>
    </div>
  </div>
  {#each headers as header, headerIndex}
    <div class="data-table-row {header.enabled ? '' : 'data-table-row-unchecked'}">
      <Checkbox
        class="data-table-cell flex-fixed-icon"
        bind:checked={header.enabled}
        on:change={refreshHeaders}
        indeterminate={false} />
      <AutoComplete
        list={autocompleteListId}
        bind:value={header.name}
        on:change={refreshHeaders}
        placeholder={nameLabel} />
      <AutoComplete
        bind:value={header.value}
        on:change={refreshHeaders}
        placeholder={valueLabel} />
      {#if !$selectedProfile.hideComment}
        <AutoComplete
          bind:value={header.comment}
          on:change={refreshHeaders}
          placeholder="Comment" />
      {/if}
      <IconButton
        dense
        aria-label="Expand"
        class="small-icon-button data-table-cell flex-fixed-icon"
        on:click={() => expandEditor(headerIndex)}>
        <MdiIcon size="24" color="#666" icon={mdiArrowExpand} />
      </IconButton>
      <IconButton
        dense
        aria-label="Delete"
        class="small-icon-button data-table-cell flex-fixed-icon"
        on:click={() => removeHeader(headerIndex)}>
        <MdiIcon size="24" icon={mdiClose} color="red" />
      </IconButton>
    </div>
  {/each}
</div>
