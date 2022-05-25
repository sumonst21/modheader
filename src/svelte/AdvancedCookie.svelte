<script>
  import Button from '@smui/button';
  import MenuSurface from '@smui/menu-surface';
  import Chip from './Chip.svelte';
  import CookieAttributeTextField from './CookieAttributeTextField.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  const fields = [
    {
      field: 'domain',
      default: '',
      component: CookieAttributeTextField,
      updateFieldHandler: (modifier) => {
        modifier.domain = modifier.domain.trim();
      }
    },
    {
      field: 'maxAge',
      default: 60 * 60 * 24,
      component: CookieAttributeTextField,
      updateFieldHandler: (modifier) => {
        const maxAge = Number.parseInt(modifier.maxAge);
        if (!Number.isNaN(maxAge)) {
          modifier.maxAge = maxAge;
        } else {
          modifier.maxAge = 60 * 60 * 24;
        }
      }
    },
    {
      field: 'path',
      default: '/',
      component: CookieAttributeTextField,
      updateFieldHandler: (modifier) => {
        modifier.path = modifier.path.trim();
      }
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
  let showField;

  const CHECKED = '✓';
  const UNCHECKED = '✗';
</script>

<div class="advanced-cookie-row">
  <div>
    {#if fields.find((f) => modifier[f.field] === undefined)}
      <Chip
        fieldName="cookie-attribute"
        trailingAction="dropdown"
        on:click={() => addAttributeMenu.setOpen(true)}
      >
        Add cookie attribute
      </Chip>
      <MenuSurface bind:this={addAttributeMenu} anchorCorner="BOTTOM_LEFT">
        {#each fields.filter((f) => modifier[f.field] === undefined) as field}
          <Button
            variant="raised"
            class="chip-button"
            data-field={field.field}
            on:click={() => {
              modifier[field.field] = field.default;
              addAttributeMenu.setOpen(false);
              dispatchChange();
            }}
          >
            {field.field}
          </Button>
        {/each}
      </MenuSurface>
    {/if}

    <Chip
      fieldName="attribute-override"
      tooltip={modifier.attributeOverride
        ? 'Cookie value and attributes will be completely overridden. Click to change behavior.'
        : 'Cookie value will be overridden, but existing cookie attributes will not be changed. Click to change behavior.'}
      on:click={() => {
        modifier.attributeOverride = !modifier.attributeOverride;
        dispatchChange();
      }}
    >
      Override mode: {modifier.attributeOverride ? 'override attributes' : 'retain attributes'}
    </Chip>
  </div>

  {#each fields.filter((f) => modifier[f.field] !== undefined) as field}
    <span>
      <Chip
        fieldName={field.field}
        trailingAction="close"
        on:click={() => {
          if (field.clickHandler) {
            field.clickHandler(modifier);
          } else {
            showField = field.field;
          }
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
      {#if field.component}
        <svelte:component
          this={field.component}
          open={showField === field.field}
          {modifier}
          fieldName={field.field}
          on:change={() => {
            field.updateFieldHandler(modifier);
            dispatchChange();
          }}
          on:close={() => (showField = undefined)}
        />
      {/if}
    </span>
  {/each}
</div>

<style module>
  .advanced-cookie-row {
    margin-left: 32px;
  }
</style>
