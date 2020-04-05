<script>
  import Dialog, { Title, Content, Actions } from "@smui/dialog";
  import IconButton from "@smui/icon-button";
  import Button, { Label } from "@smui/button";
  import Checkbox from "@smui/checkbox";
  import Menu from "@smui/menu";
  import List, { Item, Separator, Text } from "@smui/list";
  import { mdiPlus, mdiTrashCan, mdiArrowExpand, mdiSort } from "@mdi/js";
  import { createEventDispatcher } from "svelte";
  import { flip } from "svelte/animate";
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
  import lodashUniq from "lodash/uniq";
  import lodashOrderBy from "lodash/orderBy";
  import { selectedProfile, commitChange } from "../js/datasource";
  import { DISABLED_COLOR, PRIMARY_COLOR } from "../js/constants";
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

  function removeHeader(headerIndex) {
    dispatch("remove", headerIndex);
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

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scaleY(${t});
					opacity: ${t}
				`
			};
		}
  });

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

<div class="data-table {clazz}">
  <div class="data-table-row data-table-title-row">
    <Checkbox
      class="data-table-cell flex-fixed-icon"
      bind:checked={allChecked}
      indeterminate={!allChecked && !allUnchecked}
      on:click={() => toggleAll()}
      disabled={headers.length === 0} />
    <h3 class="data-table-title data-table-cell flex-grow">{title}</h3>
    <div class="data-table-cell">
      <Button on:click={() => addHeader(headers)} class="small-text-button">
        <MdiIcon size="20" icon={mdiPlus} color={PRIMARY_COLOR} middle />
        Add
      </Button>
    </div>
    <div class="data-table-cell">
      <Button
        class="small-text-button"
        on:click={e => sortMenu.setOpen(true)}
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
    </div>

    <div class="data-table-cell">
      <Button
        class="small-text-button"
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
    </div>
  </div>
  {#each headers as header, headerIndex (headerIndex)}
    <div 
				in:receive="{{key: headerIndex}}"
        animate:flip
        class="data-table-row {header.enabled ? '' : 'data-table-row-unchecked'}">
      <Checkbox
        class="data-table-cell flex-fixed-icon"
        bind:checked={header.enabled}
        on:click={refreshHeaders}
        indeterminate={false} />
      <AutoComplete
        className="mdc-text-field__input data-table-cell flex-grow"
        items={knownHeaderNames}
        bind:value={header.name}
        bind:selectedItem={header.name}
        on:change={refreshHeaders}
        placeholder={nameLabel} />
      <AutoComplete
        className="mdc-text-field__input data-table-cell flex-grow"
        items={knownHeaderValues}
        bind:value={header.value}
        bind:selectedItem={header.value}
        on:change={refreshHeaders}
        placeholder={valueLabel} />
      {#if !$selectedProfile.hideComment}
        <AutoComplete
          className="mdc-text-field__input data-table-cell flex-grow"
          items={knownHeaderComments}
          bind:value={header.comment}
          bind:selectedItem={header.comment}
          on:change={refreshHeaders}
          placeholder="Comment" />
      {/if}
      <IconButton
        dense
        aria-label="Expand"
        class="small-icon-button data-table-cell flex-fixed-icon"
        on:click={() => expandEditor(header)}>
        <MdiIcon size="24" icon={mdiArrowExpand} />
      </IconButton>
      <IconButton
        dense
        aria-label="Delete"
        class="small-icon-button data-table-cell flex-fixed-icon"
        on:click={() => removeHeader(headerIndex)}>
        <MdiIcon size="24" icon={mdiTrashCan} color="red" />
      </IconButton>
    </div>
  {/each}
</div>
