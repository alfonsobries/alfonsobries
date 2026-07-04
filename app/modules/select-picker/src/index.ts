import type { SelectPickerOptions } from './SelectPicker.types';
import SelectPickerModule from './SelectPickerModule';

export type { SelectOption, SelectPickerOptions } from './SelectPicker.types';

/**
 * Opens the native iOS option list (the settings-style sheet: searchable,
 * A–Z sections with the side index, checkmark on the selected row) and
 * resolves with the picked value, or null when dismissed without picking.
 */
export async function pickOption(options: SelectPickerOptions): Promise<string | null> {
  return SelectPickerModule.presentAsync(options);
}
