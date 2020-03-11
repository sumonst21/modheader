<script>
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Cell } from "@smui/data-table";
  import Checkbox from "@smui/checkbox";
  import Menu from "@smui/menu";
  import Select, { Option } from "@smui/select";
  import List, { Item, Separator, Text } from "@smui/list";
  import { mdiPlus, mdiTrashCan, mdiHelpCircleOutline, mdiSort } from "@mdi/js";
  import lodashUniq from "lodash/uniq";
  import lodashOrderBy from "lodash/orderBy";
  import {
    addFilter,
    removeFilter,
    selectedProfile,
    commitChange
  } from "../js/datasource";
  import Row from "./Row.svelte";
  import AutoComplete from "./Autocomplete.svelte";
  import MdiIcon from "./MdiIcon.svelte";
  import ResourceTypeMenu from "./ResourceTypeMenu.svelte";

  const disabledColor = "rgba(0, 0, 0, 0.37)";

  let selectedFilter;
  let dialog;
  let sortMenu;
  let sortMenuLocation;
  let clazz;
  let resourceTypeMenuLocation;
  export { clazz as class };

  function expandEditor(filter) {
    selectedFilter = filter;
    dialog.open();
  }

  function sort(field, order) {
    commitChange({
      filters: lodashOrderBy(filters, [field], [order])
    });
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

  $: filters = $selectedProfile.filters;
  $: allChecked = filters.every(f => f.enabled);
  $: allUnchecked = filters.every(f => !f.enabled);
  $: knownUrlRegexes = lodashUniq(
    filters.map(f => f.urlRegex).filter(n => !!n)
  );
</script>

<style scoped>
  :global(.filter-select) {
    height: 26px;
  }

  :global(.filter-select-field) {
    font-size: 14px;
    padding: 0;
    height: 26px;
    border-bottom: 1px solid #ddd !important;
  }

  :global(.filter-select) :global(.mdc-select__dropdown-icon) {
    bottom: 8px;
  }

  :global(.data-table-value-cell) {
    width: 350px;
  }
</style>

<DataTable class="data-table {clazz}">
  <Head>
    <Row class="data-table-row">
      <Cell checkbox class="data-table-cell">
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={toggleAll}
          disabled={$selectedProfile.filters.length === 0} />
      </Cell>
      <Cell class="data-table-cell">
        <h4 class="data-table-title">Filters</h4>
      </Cell>
      <Cell class="data-table-cell data-table-value-cell" colspan="3">
        <Button on:click={() => addFilter()}>
          <MdiIcon size="20" icon={mdiPlus} color="#1976d2" middle />
          Add
        </Button>
        <Button
          on:click={() => {
            sortMenu.hoistMenuToBody();
            sortMenu.setAnchorElement(sortMenuLocation);
            sortMenu.setOpen(true);
          }}
          disabled={$selectedProfile.filters.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiSort}
            color={$selectedProfile.filters.length === 0 ? disabledColor : '#1976d2'}
            middle />
          Sort
        </Button>
        <Button
          on:click={() => commitChange({ filters: [] })}
          disabled={$selectedProfile.filters.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiTrashCan}
            color={$selectedProfile.filters.length === 0 ? disabledColor : 'red'}
            middle />
          Clear
        </Button>
        <div bind:this={sortMenuLocation} />
        <Menu bind:this={sortMenu}>
          <List>
            <Item on:SMUI:action={() => sort('type', 'asc')}>
              <Text>Type - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('type', 'desc')}>
              <Text>Type - descending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('urlRegex', 'asc')}>
              <Text>URL regex - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('urlRegex', 'desc')}>
              <Text>URL regex - descending</Text>
            </Item>
          </List>
        </Menu>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each filters as filter}
      <Row class="data-table-row">
        <Cell checkbox class="data-table-cell">
          <Checkbox bind:checked={filter.enabled} indeterminate={false} />
        </Cell>
        <Cell class="data-table-cell">
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
          class="data-table-cell {filter.type === 'urls' || filter.type === 'excludeUrls' ? '' : 'hidden'}">
          <AutoComplete
            className="mdc-text-field__input filter-text-field"
            items={knownUrlRegexes}
            bind:value={filter.urlRegex}
            bind:selectedItem={filter.urlRegex}
            placeholder=".*://.*.google.com/.*" />
        </Cell>
        <Cell
          class="data-table-cell {filter.type === 'urls' || filter.type === 'excludeUrls' ? '' : 'hidden'}">
          <IconButton
            dense
            aria-label="Help"
            class="small-icon-button"
            on:click={() => openLink('https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions')}>
            <MdiIcon size="24" icon={mdiHelpCircleOutline} color="#1976d2" />
          </IconButton>
        </Cell>
        <Cell
          class="data-table-cell {filter.type === 'types' ? '' : 'hidden'}"
          colspan="2">
          <ResourceTypeMenu
            bind:resourceType={filter.resourceType}
            {resourceTypeMenuLocation} />
        </Cell>
        <Cell class="data-table-cell">
          <IconButton
            dense
            aria-label="Delete"
            class="small-icon-button"
            on:click={() => removeFilter(filter)}>
            <MdiIcon size="24" icon={mdiTrashCan} color="red" />
          </IconButton>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
