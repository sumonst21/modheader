<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  // ID to the datalist of items the user can select from
  export let list;
  // the text displayed when no option is selected
  export let placeholder;
  export let value;
</script>

<style>
  .autocomplete-input {
    box-sizing: border-box;
    font: inherit;
    border: none;
    height: 30px;
    width: 100%;
    background: none;
    margin: 0;
    outline: none;
    padding: 0;
  }
</style>

<div class="mdc-text-field__input data-table-cell flex-grow autocomplete">
  <input
    type="text"
    class="input autocomplete-input"
    {placeholder}
    {list}
    autocomplete="on"
    bind:value={value}
    on:input={() => dispatch('input')} />
</div>
