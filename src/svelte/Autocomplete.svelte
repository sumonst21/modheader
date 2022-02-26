<script>
  import Textfield from '@smui/textfield';
  import { createEventDispatcher } from 'svelte';

  function selectText() {
    if (selectAllOnFocus) {
      textField.getElement().querySelector('input').select();
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
  bind:this={textField}
  type="text"
  input$placeholder={placeholder}
  input$list={list}
  input$autocomplete="on"
  bind:value
  on:input={() => dispatch('input')}
  on:change={() => dispatch('change')}
  on:focus={selectText}
/>
