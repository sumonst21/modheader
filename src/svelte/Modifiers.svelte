<script>
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import { mdiClose } from '@mdi/js';
  import lodashClone from 'lodash/clone.js';
  import lodashDebounce from 'lodash/debounce.js';
  import { fly } from 'svelte/transition';
  import { selectedProfile } from '../js/profile.js';
  import AutoComplete from './Autocomplete.svelte';
  import ModifiersMoreMenu from './ModifiersMoreMenu.svelte';
  import MdiIcon from './MdiIcon.svelte';
  import HeaderMoreMenu from './HeaderMoreMenu.svelte';
  import { MODIFIER_TYPES } from '../js/modifier-handler.js';

  export let modifierType;
  export let headers;
  let allChecked;
  let allUnchecked;

  function copy(headerIndex) {
    headers = [
      ...headers.slice(0, headerIndex),
      lodashClone(headers[headerIndex]),
      ...headers.slice(headerIndex)
    ];
    refreshHeaders();
  }

  function refreshHeaders() {
    MODIFIER_TYPES[modifierType].refreshHandler(headers);
    allChecked = headers.every((h) => h.enabled);
    allUnchecked = headers.every((h) => !h.enabled);
  }

  function toggleAll() {
    if (!allChecked) {
      headers.forEach((h) => (h.enabled = true));
    } else {
      headers.forEach((h) => (h.enabled = false));
    }
    refreshHeaders();
  }

  const refreshHeadersDebounce = lodashDebounce(refreshHeaders, 500, {
    leading: true,
    trailing: true
  });
  $: headers, refreshHeadersDebounce();
  $: modifierHandler = MODIFIER_TYPES[modifierType];
  $: customAutocomplete =
    modifierHandler &&
    $selectedProfile &&
    $selectedProfile[modifierHandler.customAutocompleteFieldName];

  selectedProfile.subscribe(() => {
    refreshHeadersDebounce.cancel();
  });
</script>

{#if modifierHandler.autocompleteListId && modifierHandler.autocompleteNames}
  <datalist id={modifierHandler.autocompleteListId}>
    {#if customAutocomplete && customAutocomplete.autocompleteName.length > 0}
      {#each customAutocomplete.autocompleteName as item}
        <option value={item} />
      {/each}
    {/if}
    {#each modifierHandler.autocompleteNames as item}
      <option value={item} />
    {/each}
  </datalist>
{/if}

{#if customAutocomplete && customAutocomplete.autocompleteName}
  <datalist id="{modifierHandler.customAutocompleteFieldName}-name">
    {#each customAutocomplete.autocompleteName as item}
      <option value={item} />
    {/each}
  </datalist>
{/if}

{#if customAutocomplete && customAutocomplete.autocompleteValue}
  <datalist id="{modifierHandler.customAutocompleteFieldName}-value">
    {#each customAutocomplete.autocompleteValue as item}
      <option value={item} />
    {/each}
  </datalist>
{/if}

<div class="data-table extra-gap" id={modifierType} transition:fly>
  <div class="data-table-row data-table-title-row">
    <Checkbox
      class="data-table-cell flex-fixed-icon"
      bind:checked={allChecked}
      indeterminate={!allChecked && !allUnchecked}
      on:click={() => toggleAll()}
      disabled={headers.length === 0}
    />
    <h3 class="data-table-title data-table-cell flex-grow">{modifierHandler.title}</h3>
    <div class="data-table-cell" />
    <div class="data-table-cell">
      <ModifiersMoreMenu
        {modifierHandler}
        modifiers={headers}
        on:refresh={(event) => {
          headers = event.detail;
          refreshHeaders();
        }}
      />
    </div>
  </div>
  {#each headers as header, headerIndex}
    <div class="data-table-row" class:data-table-row-unchecked={!header.enabled}>
      <Checkbox
        class="data-table-cell flex-fixed-icon"
        bind:checked={header.enabled}
        on:change={refreshHeaders}
        indeterminate={false}
      />
      <AutoComplete
        name="header-name"
        list={header.name
          ? modifierHandler.autocompleteListId
          : `${modifierHandler.customAutocompleteFieldName}-name`}
        bind:value={header.name}
        on:change={refreshHeaders}
        selectAllOnFocus={true}
        placeholder={modifierHandler.nameLabel}
      />
      <AutoComplete
        name="header-value"
        list={`${modifierHandler.customAutocompleteFieldName}-value`}
        bind:value={header.value}
        on:change={refreshHeaders}
        selectAllOnFocus={true}
        placeholder={modifierHandler.valueLabel}
      />
      {#if !$selectedProfile.hideComment}
        <AutoComplete
          name="header-comment"
          bind:value={header.comment}
          on:change={refreshHeaders}
          placeholder="Comment"
        />
      {/if}

      <IconButton
        dense
        aria-label="Delete"
        class="small-icon-button data-table-cell flex-fixed-icon"
        on:click={() => modifierHandler.removeHandler(headerIndex)}
      >
        <MdiIcon size="24" icon={mdiClose} color="red" />
      </IconButton>
      <HeaderMoreMenu
        title={modifierHandler.title}
        nameLabel={modifierHandler.nameLabel}
        valueLabel={modifierHandler.valueLabel}
        extraMoreMenuItems={modifierHandler.extraMoreMenuItems}
        selectedHeaderIndex={headerIndex}
        selectedHeader={header}
        on:copy={(e) => copy(e.detail)}
        on:update={(e) => {
          headers[e.detail.headerIndex] = e.detail.header;
          refreshHeaders();
        }}
      />
    </div>
    {#if modifierHandler.advancedComponent}
      <div class:data-table-row-unchecked={!header.enabled}>
        <svelte:component
          this={modifierHandler.advancedComponent}
          modifier={header}
          on:change={refreshHeaders}
        />
      </div>
    {/if}
  {/each}
</div>
