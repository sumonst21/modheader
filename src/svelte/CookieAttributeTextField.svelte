<script>
  import Textfield from '@smui/textfield';
  import IconButton from '@smui/icon-button';
  import MenuSurface from '@smui/menu-surface';
  import { mdiCheckCircle } from '@mdi/js';
  import MdiIcon from './MdiIcon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let open;
  export let modifier;
  export let fieldName;

  let menu;
  let textfield;
</script>

<MenuSurface
  bind:this={menu}
  {open}
  quickOpen={true}
  on:SMUIMenuSurface:opened={() => {
    setTimeout(() => {
      textfield.focus();
    }, 100);
  }}
  on:SMUIMenuSurface:closed={() => dispatch('close')}
>
  <form
    class="menu-content"
    on:submit|preventDefault|stopPropagation={() => {
      dispatch('change');
      menu.setOpen(false);
    }}
  >
    <Textfield
      style="min-width: 100px"
      label={fieldName}
      bind:this={textfield}
      bind:value={modifier[fieldName]}
      on:change={() => dispatch('change')}
    />
    <IconButton>
      <MdiIcon icon={mdiCheckCircle} size="24" />
    </IconButton>
  </form>
</MenuSurface>

<style module>
  .menu-content {
    display: flex;
    margin: 4px;
    font-size: 1em;
  }
</style>
