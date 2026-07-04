import { NativeModule, requireNativeModule } from 'expo';

import type { SelectPickerOptions } from './SelectPicker.types';

declare class SelectPickerModule extends NativeModule<Record<string, never>> {
  /**
   * Presents the native option list sheet; resolves with the picked value, or
   * null when dismissed without picking.
   */
  presentAsync(options: SelectPickerOptions): Promise<string | null>;
}

export default requireNativeModule<SelectPickerModule>('SelectPicker');
