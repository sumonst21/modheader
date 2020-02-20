<script>
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import AutoComplete from "./Autocomplete.svelte";
  import Checkbox from "@smui/checkbox";
  import MdiIcon from "./MdiIcon.svelte";
  import { mdiPlus, mdiTrashCan } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import _ from "lodash";

  const dispatch = createEventDispatcher();

  export let profile;
  export let headers;
  export let title;
  export let autocompleteNames;
  let clazz;
  export { clazz as class };

  function addHeader() {
    dispatch("add", {});
  }

  function removeHeader(header) {
    dispatch("remove", header);
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
  $: knownHeaderNames = _.uniq(
    headers
      .map(h => h.name)
      .filter(n => !!n)
      .concat(autocompleteNames)
  );
  $: knownHeaderValues = _.uniq(headers.map(h => h.value).filter(n => !!n));
  $: knownHeaderComments = _.uniq(headers.map(h => h.comment).filter(n => !!n));
</script>

<style>
  :global(.header-table) {
    border-color: #bbb;
    width: calc(100% - 4px);
  }

  :global(.header-table-row) {
    height: 20px;
    margin: 0;
    padding: 0;
    border-top-color: #eee;
  }

  :global(.header-table-cell) {
    padding-left: 5px;
    padding-right: 5px;
  }

  :global(.small-icon-button) {
    width: 32px;
    height: 32px;
    padding: 5px;
  }

  :global(.autocomplete-input) {
    border: none;
    border-bottom: 1px solid #ddd;
    height: 32px;
    width: 100%;
    background: none;
    margin: 0;
    outline: none;
    padding: 0;
  }
</style>

<DataTable class="header-table {clazz}">
  <Head>
    <Row class="header-table-row">
      <Cell checkbox class="header-table-cell">
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={toggleAll} />
      </Cell>
      <Cell class="header-table-cell">
        <h4 class="header-table-row">{title}</h4>
      </Cell>
      <Cell class="header-table-cell">
        <IconButton on:click={addHeader(headers)} class="small-icon-button">
          <MdiIcon size="20" icon={mdiPlus} color="#1976d2" middle />
        </IconButton>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each headers as header}
      <Row class="header-table-row">
        <Cell checkbox class="header-table-cell">
          <Checkbox bind:checked={header.enabled} indeterminate={false} />
        </Cell>
        <Cell class="header-table-cell">
          <AutoComplete
            className="mdc-text-field__input header-text-field"
            items={knownHeaderNames}
            bind:value={header.name}
            bind:selectedItem={header.name}
            noResultsText=""
            placeholder="Name" />
        </Cell>
        <Cell class="header-table-cell">
          <AutoComplete
            className="mdc-text-field__input header-text-field"
            items={knownHeaderValues}
            bind:value={header.value}
            bind:selectedItem={header.value}
            noResultsText=""
            placeholder="Value" />
        </Cell>
        {#if !profile.hideComment}
          <Cell class="header-table-cell">
            <AutoComplete
              className="mdc-text-field__input header-text-field"
              items={knownHeaderComments}
              bind:value={header.comment}
              bind:selectedItem={header.comment}
              noResultsText=""
              placeholder="Comment" />
          </Cell>
        {/if}
        <Cell class="header-table-cell">
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
