import { writable } from 'svelte/store';

export const showExportDialog = writable(false);
export const showExportJsonDialog = writable(false);
export const showImportDialog = writable(false);
export const showCloudBackupDialog = writable(false);
export const showUpgradeDialog = writable(false);
export const requireSignInDialog = writable(false);

export const requireSignInDialogContent = writable('');
