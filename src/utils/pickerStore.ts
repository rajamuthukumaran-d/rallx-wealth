type PickerCallback = (id: string, label: string) => void;

let _pending: PickerCallback | null = null;

export const pickerStore = {
  register(cb: PickerCallback) {
    if (_pending !== null) {
      console.warn('pickerStore: registering over an unresolved callback');
    }
    _pending = cb;
  },
  resolve(id: string, label: string) {
    _pending?.(id, label);
    _pending = null;
  },
  clear() {
    _pending = null;
  },
};
