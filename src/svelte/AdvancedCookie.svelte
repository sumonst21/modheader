<script>
  import Button from '@smui/button';
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import Chip from './Chip.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const fields = [
    {
      field: 'domain',
      default: '',
      clickHandler: (modifier) => {}
    },
    {
      field: 'maxAge',
      default: 60 * 60 * 24,
      clickHandler: (modifier) => {}
    },
    {
      field: 'path',
      default: '/',
      clickHandler: (modifier) => {}
    },
    {
      field: 'secure',
      default: true,
      type: 'boolean',
      clickHandler: (modifier) => {
        modifier.secure = !modifier.secure;
      }
    },
    {
      field: 'httpOnly',
      default: true,
      type: 'boolean',
      clickHandler: (modifier) => {
        modifier.httpOnly = !modifier.httpOnly;
      }
    },
    {
      field: 'priority',
      default: 'medium',
      clickHandler: (modifier) => {
        const choices = ['low', 'medium', 'high'];
        modifier.priority = getNextChoice(modifier.priority, choices) || 'medium';
      }
    },
    {
      field: 'sameSite',
      default: 'strict',
      clickHandler: (modifier) => {
        const choices = ['lax', 'none', 'strict'];
        modifier.sameSite = getNextChoice(modifier.sameSite, choices) || 'strict';
      }
    }
  ];

  function dispatchChange() {
    dispatch('change');
  }

  function getNextChoice(selectedChoice, choices) {
    let selectedChoiceIndex = choices.indexOf(selectedChoice);
    if (selectedChoiceIndex < 0) {
      return undefined;
    }
    selectedChoiceIndex++;
    if (selectedChoiceIndex >= choices.length) {
      selectedChoiceIndex = 0;
    }
    return choices[selectedChoiceIndex];
  }

  function boolToUnicode(isChecked) {
    return isChecked ? CHECKED : UNCHECKED;
  }

  export let modifier;
  let addAttributeMenu;

  const CHECKED = '✓';
  const UNCHECKED = '✗';
</script>

<div class="advanced-cookie-row">
  {#if fields.find((f) => modifier[f.field] === undefined)}
    <Button name="cookie-attribute" on:click={() => addAttributeMenu.setOpen(true)}>
      Add cookie attribute
    </Button>
    <Menu bind:this={addAttributeMenu}>
      <List>
        {#each fields.filter((f) => modifier[f.field] === undefined) as field}
          <Item
            data-field={field.field}
            on:SMUI:action={() => {
              modifier[field.field] = field.default;
              dispatchChange();
            }}
          >
            Add {field.field} attribute
          </Item>
        {/each}
      </List>
    </Menu>
  {/if}

  {#each fields.filter((f) => modifier[f.field] !== undefined) as field}
    <Chip
      on:click={() => {
        field.clickHandler(modifier);
        dispatchChange();
      }}
      on:close={() => {
        delete modifier[field.field];
        dispatchChange();
      }}
    >
      {field.field}: {field.type === 'boolean'
        ? boolToUnicode(modifier[field.field])
        : modifier[field.field]}
    </Chip>
  {/each}
</div>
