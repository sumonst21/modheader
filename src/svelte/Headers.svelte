<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Cell } from "@smui/data-table";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import Row from "./Row.svelte";
  import AutoComplete from "./Autocomplete.svelte";
  import Checkbox from "@smui/checkbox";
  import MdiIcon from "./MdiIcon.svelte";
  import { mdiPlus, mdiTrashCan, mdiArrowExpand, mdiSort } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import lodashUniq from "lodash/uniq";
  import lodashOrderBy from "lodash/orderBy";

  const dispatch = createEventDispatcher();
  const disabledColor = "rgba(0, 0, 0, 0.37)";

  export let profile;
  export let headers;
  export let title;
  export let autocompleteNames;
  let selectedHeader;
  let dialog;
  let sortMenu;
  let sortMenuLocation;
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

<style scoped>
  .large-textarea {
    width: 100%;
    height: 50px;
  }
</style>

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
        <label>Name</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.name} />
      </div>
      <div class="mdc-text-field mdc-text-field--textarea">
        <label>Value</label>
        <textarea
          class="mdc-text-field__input large-textarea"
          bind:value={selectedHeader.value}
          placeholder="Value" />
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
      <Cell checkbox class="data-table-cell">
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={toggleAll}
          disabled={headers.length === 0} />
      </Cell>
      <Cell class="data-table-cell">
        <h4 class="data-table-title">{title}</h4>
      </Cell>
      <Cell class="data-table-cell" colspan="3">
        <Button on:click={addHeader(headers)}>
          <MdiIcon size="20" icon={mdiPlus} color="#1976d2" middle />
          Add
        </Button>
        <Button
          on:click={() => {
            sortMenu.hoistMenuToBody();
            sortMenu.setAnchorElement(sortMenuLocation);
            sortMenu.setOpen(true);
          }}
          disabled={headers.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiSort}
            color={headers.length === 0 ? disabledColor : '#1976d2'}
            middle />
          Sort
        </Button>
        <Button
          on:click={() => {
            headers = [];
            refreshHeaders();
          }}
          disabled={headers.length === 0}>
          <MdiIcon
            size="20"
            icon={mdiTrashCan}
            color={headers.length === 0 ? disabledColor : 'red'}
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
    {#each headers as header}
      <Row class="data-table-row">
        <Cell checkbox class="data-table-cell">
          <Checkbox bind:checked={header.enabled} indeterminate={false} />
        </Cell>
        <Cell class="data-table-cell">
          <AutoComplete
            className="mdc-text-field__input"
            items={knownHeaderNames}
            bind:value={header.name}
            bind:selectedItem={header.name}
            placeholder="Name" />
        </Cell>
        <Cell class="data-table-cell">
          <AutoComplete
            className="mdc-text-field__input"
            items={knownHeaderValues}
            bind:value={header.value}
            bind:selectedItem={header.value}
            placeholder="Value" />
        </Cell>
        {#if !profile.hideComment}
          <Cell class="data-table-cell">
            <AutoComplete
              className="mdc-text-field__input"
              items={knownHeaderComments}
              bind:value={header.comment}
              bind:selectedItem={header.comment}
              placeholder="Comment" />
          </Cell>
        {/if}
        <Cell class="data-table-cell">
          <IconButton
            dense
            aria-label="Expand"
            class="small-icon-button"
            on:click={expandEditor(header)}>
            <MdiIcon size="24" icon={mdiArrowExpand} />
          </IconButton>
        </Cell>
        <Cell class="data-table-cell">
          <IconButton
            dense
            aria-label="Delete"
            class="small-icon-button"
            on:click={removeHeader(header)}>
            <MdiIcon size="24" icon={mdiTrashCan} color="red" />
          </IconButton>
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
