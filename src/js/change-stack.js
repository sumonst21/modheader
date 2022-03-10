import { writable } from 'svelte/store';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashIsEqual from 'lodash/isEqual';
import lodashLast from 'lodash/last';

const changes = [];
export const canUndoChange = writable(false);
let ignoringChangeStack = true;

export const __testing__ = { ignoringChangeStack, changes };

function updateCanUndo() {
  canUndoChange.set(changes.length > 1);
}

export function undoChange() {
  if (changes.length > 0) {
    const change = changes.pop();
    updateCanUndo();
    return change;
  }
}

export function commit(changeHandler) {
  ignoringChangeStack = true;
  try {
    const change = changeHandler();
    changes.push(change);
    updateCanUndo();
  } finally {
    ignoringChangeStack = false;
  }
}

export function startIgnoringChange() {
  ignoringChangeStack = true;
}

export function stopIgnoringChange() {
  ignoringChangeStack = false;
}

export function setChangeField(name, value) {
  if (!ignoringChangeStack) {
    const valueCopy = lodashCloneDeep(value);
    if (changes.length === 0 || !lodashIsEqual(lodashLast(changes)[name], value)) {
      changes.push({ [name]: valueCopy });
      updateCanUndo();
    }
  }
}
