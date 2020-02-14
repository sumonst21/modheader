<script>
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Checkbox from "@smui/checkbox";
  import MdiIcon from "./MdiIcon.svelte";
  import { mdiPlus, mdiTrashCan } from "@mdi/js";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let profile;
  export let headers;
  export let title;
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
</script>

<style scoped>
  :global(.header-table) {
    width: 100%;
  }
  :global(.header-table-row) {
    height: 20px;
    margin: 0;
    padding: 0;
  }

  :global(.small-icon-button) {
    width: 32px;
    height: 32px;
    padding: 5px;
  }

  .header-text-field {
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
      <Cell checkbox>
        <Checkbox
          bind:checked={allChecked}
          indeterminate={!allChecked && !allUnchecked}
          on:click={toggleAll} />
      </Cell>
      <Cell>
        <h4 class="header-table-row">{title}</h4>
      </Cell>
      <Cell>
        <IconButton on:click={addHeader(headers)} class="small-icon-button">
          <MdiIcon size="20" icon={mdiPlus} color="#1976d2" middle />
        </IconButton>
      </Cell>
    </Row>
  </Head>
  <Body>
    {#each headers as header}
      <Row class="header-table-row">
        <Cell checkbox>
          <Checkbox bind:checked={header.enabled} indeterminate={false} />
        </Cell>
        <Cell>
          <input
            class="mdc-text-field__input header-text-field"
            bind:value={header.name}
            placeholder="Name" />
        </Cell>
        <Cell>
          <input
            class="mdc-text-field__input header-text-field"
            bind:value={header.value}
            placeholder="Value" />
        </Cell>
        {#if !profile.hideComment}
          <Cell>
            <input
              class="mdc-text-field__input header-text-field"
              bind:value={header.comment}
              placeholder="Comment" />
          </Cell>
        {/if}
        <Cell>
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
