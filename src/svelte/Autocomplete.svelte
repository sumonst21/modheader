<script>
  import Textfield from '@smui/textfield';
  import { createEventDispatcher } from 'svelte';

  function selectText(e) {
    if (selectAllOnFocus) {
      e.target.select();
    }
  }

  const dispatch = createEventDispatcher();
  // ID to the datalist of items the user can select from
  export let list;
  // the text displayed when no option is selected
  export let placeholder;
  export let value;
  export let selectAllOnFocus;
  let textField;
</script>

<Textfield
  class="data-table-cell flex-grow autocomplete-input"
  input$bind:this={textField}
  type="text"
  input$placeholder={placeholder}
  input$list={list}
  input$autocomplete="on"
  bind:value
  on:input={() => dispatch('input')}
  on:change={() => dispatch('change')}
  on:focus={selectText}
/>

<style>
  :global(.autocomplete-input) {
    border: none;
    height: 30px;
    width: 100%;
    top: -4px;
  }

  :global(.autocomplete-input) :global(.mdc-text-field__input) {
    border-bottom-color: rgba(0.5, 0.5, 0.5, 0.1) !important;
    padding-bottom: 10px !important;
  }
</style>
