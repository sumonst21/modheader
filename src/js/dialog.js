import { writable } from 'svelte/store';

export const showExportDialog = writable(false);
export const showImportDialog = writable(false);
export const showCloudBackupDialog = writable(false);
