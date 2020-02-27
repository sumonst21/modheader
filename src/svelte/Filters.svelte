<script>
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Menu from "@smui/menu";
  import Select, { Option } from "@smui/select";
  import List, { Item, Separator, Text } from "@smui/list";
  import AutoComplete from "./Autocomplete.svelte";
  import Checkbox from "@smui/checkbox";
  import MdiIcon from "./MdiIcon.svelte";
  import ResourceTypeMenu from "./ResourceTypeMenu.svelte";
  import { mdiPlus, mdiTrashCan, mdiHelpCircleOutline, mdiSort } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import lodashUniq from "lodash/uniq";
  import lodashOrderBy from "lodash/orderBy";

  const dispatch = createEventDispatcher();
  const disabledColor = "rgba(0, 0, 0, 0.37)";

  export let profile;
  export let filters;
  let selectedFilter;
  let dialog;
  let sortMenu;
  let sortMenuLocation;
  let clazz;
  export { clazz as class };

  function addFilter() {
    dispatch("add");
  }

  function removeFilter(filter) {
    dispatch("remove", filter);
  }

  function expandEditor(filter) {
    selectedFilter = filter;
    dialog.open();
  }

  function sort(field, order) {
    filters = lodashOrderBy(filters, [field], [order]);
    refreshFilters();
  }

  function refreshFilters() {
    dispatch("refresh", filters);
  }

  function openLink(link) {
    chrome.tabs.create({ url: link });
  }

  function toggleAll() {
    if (!allChecked) {
      filters.forEach(f => (f.enabled = true));
    } else {
      filters.forEach(f => (f.enabled = false));
    }
  }

  $: allChecked = filters.every(f => f.enabled);
  $: allUnchecked = filters.every(f => !f.enabled);
  $: knownUrlRegexes = lodashUniq(
    filters.map(f => f.urlRegex).filter(n => !!n)
  );
</script>

<style scoped>
  :global(.filter-table) {
    border-color: #bbb;
    width: calc(100% - 4px);
  }

  :global(.filter-table-row) {
    height: 20px;
    margin: 0;
    padding: 0;
    border-top-color: #eee;
  }

  :global(.filter-table-cell) {
    padding-left: 5px;
    padding-right: 5px;
  }

  :global(.filter-select) {
    height: 32px;
  }

  :global(.filter-select-field) {
    font-size: 14px;
    padding: 0;
    height: 32px;
    border-bottom: 1px solid #ddd !important;
  }

  :global(.filter-select) :global(.mdc-select__dropdown-icon) {
    bottom: 8px;
  }
</style>

<DataTable class="filter-table {clazz}">
  <Head>
    <Row class="filter-table-row">
      <Cell checkbox class="filter-table-cell">
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={toggleAll}
          disabled={filters.length === 0} />
      </Cell>
      <Cell class="filter-table-cell">
        <h4 class="filter-table-row">Filters</h4>
      </Cell>
      <Cell class="filter-table-cell" colspan="3">
        <Button on:click={addFilter(filters)}>
          <MdiIcon size="20" icon={mdiPlus} color="#1976d2" middle />
          Add
        </Button>
        <Button
          on:click={() => {
            sortMenu.hoistMenuToBody();
            sortMenu.setAnchorElement(sortMenuLocation);
            sortMenu.setOpen(true);
          }}
          disabled={filters.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiSort}
            color={filters.length === 0 ? disabledColor : '#1976d2'}
            middle />
          Sort
        </Button>
        <Button
          on:click={() => {
            filters = [];
            refreshFilters();
          }}
          disabled={filters.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiTrashCan}
            color={filters.length === 0 ? disabledColor : 'red'}
            middle />
          Clear
        </Button>
        <div bind:this={sortMenuLocation} />
        <Menu bind:this={sortMenu}>
          <List>
            <Item on:SMUI:action={() => sort('name', 'asc')}>
              <Text>Name - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('name', 'desc')}>
              <Text>Name - descending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('value', 'asc')}>
              <Text>Value - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('value', 'desc')}>
              <Text>Value - descending</Text>
            </Item>
            {#if !profile.hideComment}
              <Item on:SMUI:action={() => sort('comment', 'asc')}>
                <Text>Comment - ascending</Text>
              </Item>
              <Item on:SMUI:action={() => sort('comment', 'desc')}>
                <Text>Comment - descending</Text>
              </Item>
            {/if}
          </List>
        </Menu>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each filters as filter}
      <Row class="filter-table-row">
        <Cell checkbox class="filter-table-cell">
          <Checkbox bind:checked={filter.enabled} indeterminate={false} />
        </Cell>
        <Cell class="filter-table-cell">
          <Select
            bind:value={filter.type}
            class="filter-select"
            input$class="filter-select-field">
            <Option value="urls" selected={filter.type === 'urls'}>
              URL Pattern
            </Option>
            <Option
              value="excludeUrls"
              selected={filter.type === 'excludeUrls'}>
              Exclude URL Pattern
            </Option>
            <Option value="types" selected={filter.type === 'types'}>
              Resource Type
            </Option>
          </Select>
        </Cell>
        <Cell
          class="filter-table-cell {filter.type === 'urls' || filter.type === 'excludeUrls' ? '' : 'hidden'}">
          <AutoComplete
            className="mdc-text-field__input filter-text-field"
            items={knownUrlRegexes}
            bind:value={filter.urlRegex}
            bind:selectedItem={filter.urlRegex}
            placeholder=".*://.*.google.com/.*" />
        </Cell>
        <Cell
          class="filter-table-cell {filter.type === 'urls' || filter.type === 'excludeUrls' ? '' : 'hidden'}">
          <IconButton
            dense
            aria-label="Help"
            class="small-icon-button"
            on:click={() => openLink('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions')}>
            <MdiIcon size="24" icon={mdiHelpCircleOutline} color="#1976d2" />
          </IconButton>
        </Cell>
        <Cell
          class="filter-table-cell {filter.type === 'types' ? '' : 'hidden'}"
          colspan="2">
          <ResourceTypeMenu bind:resourceType={filter.resourceType} />
        </Cell>
        <Cell class="filter-table-cell">
          <IconButton
            dense
            aria-label="Delete"
            class="small-icon-button"
            on:click={removeFilter(filter)}>
            <MdiIcon size="24" icon={mdiTrashCan} color="red" />
          </IconButton>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
