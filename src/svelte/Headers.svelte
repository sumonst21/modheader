<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Cell } from "@smui/data-table";
  import Checkbox from "@smui/checkbox";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import { mdiPlus, mdiTrashCan, mdiArrowExpand, mdiSort } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import lodashUniq from "lodash/uniq";
  import lodashOrderBy from "lodash/orderBy";
  import { selectedProfile, commitChange } from "../js/datasource";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
  import Row from "./Row.svelte";
  import AutoComplete from "./Autocomplete.svelte";
  import MdiIcon from "./MdiIcon.svelte";

  const dispatch = createEventDispatcher();

  export let headers;
  export let title;
  export let autocompleteNames;
  export let nameLabel = "Name";
  export let valueLabel = "Value";
  let selectedHeader;
  let dialog;
  let sortMenu;
  let clazz;
  export { clazz as class };

  function addHeader() {
    dispatch("add");
  }

  function removeHeader(header) {
    dispatch("remove", header);
  }

  function expandEditor(header) {
    selectedHeader = header;
    dialog.open();
  }

  function sort(field, order) {
    headers = lodashOrderBy(headers, [field], [order]);
    refreshHeaders();
  }

  function refreshHeaders() {
    dispatch("refresh", headers);
  }

  function toggleAll() {
    if (!allChecked) {
      headers.forEach(h => (h.enabled = true));
    } else {
      headers.forEach(h => (h.enabled = false));
    }
    refreshHeaders();
  }

  $: allChecked = headers.every(h => h.enabled);
  $: allUnchecked = headers.every(h => !h.enabled);
  $: knownHeaderNames = lodashUniq(
    headers
      .map(h => h.name)
      .filter(n => !!n)
      .concat(autocompleteNames)
  );
  $: knownHeaderValues = lodashUniq(headers.map(h => h.value).filter(n => !!n));
  $: knownHeaderComments = lodashUniq(
    headers.map(h => h.comment).filter(n => !!n)
  );
</script>

<Dialog
  bind:this={dialog}
  class="expanded-dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
  on:MDCDialog:closed={refreshHeaders}>
  <Title id="dialog-title">{title}</Title>
  <Content id="dialog-content">
    {#if selectedHeader}
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>{nameLabel}</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.name}
          placeholder={nameLabel} />
      </div>
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>{valueLabel}</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.value}
          placeholder={valueLabel} />
      </div>
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>Comment</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.comment}
          placeholder="Comment" />
      </div>
    {/if}
  </Content>
  <Actions>
    <Button>
      <Label>Done</Label>
    </Button>
  </Actions>
</Dialog>

<DataTable class="data-table {clazz}">
  <Head>
    <Row class="data-table-row">
      <Cell checkbox class="data-table-cell data-table-checkbox-cell">
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={() => toggleAll()}
          disabled={headers.length === 0} />
      </Cell>
      <Cell class="data-table-cell data-table-title-cell">
        <h4 class="data-table-title">{title}</h4>
      </Cell>
      <Cell
        class="data-table-cell"
        colspan={$selectedProfile.hideComment ? 3 : 4}>
        <Button on:click={() => addHeader(headers)}>
          <MdiIcon size="20" icon={mdiPlus} color={PRIMARY_COLOR} middle />
          Add
        </Button>
        <Button
          on:click={e => {
            sortMenu.setFixedPosition(true);
            const rect = e.target.getBoundingClientRect();
            sortMenu.setAbsolutePosition(rect.left + window.scrollX, e.target.offsetParent.offsetTop + rect.top + window.scrollY);
            sortMenu.setOpen(true);
          }}
          disabled={headers.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiSort}
            color={headers.length === 0 ? DISABLED_COLOR : PRIMARY_COLOR}
            middle />
          Sort
        </Button>

        <Menu bind:this={sortMenu} quickOpen>
          <List class="sort-menu">
            <Item on:SMUI:action={() => sort('name', 'asc')}>
              <Text>{nameLabel} - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('name', 'desc')}>
              <Text>{nameLabel} - descending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('value', 'asc')}>
              <Text>{valueLabel} - ascending</Text>
            </Item>
            <Item on:SMUI:action={() => sort('value', 'desc')}>
              <Text>{valueLabel} - descending</Text>
            </Item>
            {#if !$selectedProfile.hideComment}
              <Item on:SMUI:action={() => sort('comment', 'asc')}>
                <Text>Comment - ascending</Text>
              </Item>
              <Item on:SMUI:action={() => sort('comment', 'desc')}>
                <Text>Comment - descending</Text>
              </Item>
            {/if}
          </List>
        </Menu>

        <Button
          on:click={() => {
            headers = [];
            refreshHeaders();
          }}
          disabled={headers.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiTrashCan}
            color={headers.length === 0 ? DISABLED_COLOR : 'red'}
            middle />
          Clear
        </Button>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each headers as header}
      <Row class="data-table-row">
        <Cell checkbox class="data-table-cell">
          <Checkbox
            bind:checked={header.enabled}
            on:click={refreshHeaders}
            indeterminate={false} />
        </Cell>
        <Cell class="data-table-cell">
          <AutoComplete
            className="mdc-text-field__input"
            items={knownHeaderNames}
            bind:value={header.name}
            bind:selectedItem={header.name}
            on:change={refreshHeaders}
            placeholder={nameLabel} />
        </Cell>
        <Cell class="data-table-cell">
          <AutoComplete
            className="mdc-text-field__input"
            items={knownHeaderValues}
            bind:value={header.value}
            bind:selectedItem={header.value}
            on:change={refreshHeaders}
            placeholder={valueLabel} />
        </Cell>
        {#if !$selectedProfile.hideComment}
          <Cell class="data-table-cell">
            <AutoComplete
              className="mdc-text-field__input"
              items={knownHeaderComments}
              bind:value={header.comment}
              bind:selectedItem={header.comment}
              on:change={refreshHeaders}
              placeholder="Comment" />
          </Cell>
        {/if}
        <Cell class="data-table-cell">
          <IconButton
            dense
            aria-label="Expand"
            class="small-icon-button"
            on:click={() => expandEditor(header)}>
            <MdiIcon size="24" icon={mdiArrowExpand} />
          </IconButton>
        </Cell>
        <Cell class="data-table-cell">
          <IconButton
            dense
            aria-label="Delete"
            class="small-icon-button"
            on:click={() => removeHeader(header)}>
            <MdiIcon size="24" icon={mdiTrashCan} color="red" />
          </IconButton>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
