import { registerWebModule, NativeModule } from 'expo';

import type { SelectPickerOptions } from './SelectPicker.types';

// The native option list is iOS-only; on web the picker resolves to null.
class SelectPickerModule extends NativeModule<Record<string, never>> {
  async presentAsync(_options: SelectPickerOptions): Promise<string | null> {
    return null;
  }
}

export default registerWebModule(SelectPickerModule, 'SelectPickerModule');
