// src/components/NetWorth/Investments/MenuPickerField.tsx
import { TouchableOpacity } from 'react-native';
import { Menu, TextInput, useTheme } from 'react-native-paper';

type PickerItem = { label: string; value: string };

type MenuPickerFieldProps = {
  label: string;
  displayValue: string;
  visible: boolean;
  onOpen: () => void;
  onDismiss: () => void;
  items: PickerItem[];
  onSelect: (value: string) => void;
  style?: object;
};

export function MenuPickerField({
  label,
  displayValue,
  visible,
  onOpen,
  onDismiss,
  items,
  onSelect,
  style,
}: MenuPickerFieldProps) {
  const theme = useTheme();
  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      anchor={
        <TouchableOpacity onPress={onOpen}>
          <TextInput
            label={label}
            value={displayValue}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            right={<TextInput.Icon icon="chevron-down" />}
            style={style ?? { backgroundColor: theme.colors.elevation.level2 }}
          />
        </TouchableOpacity>
      }
    >
      {items.map((item) => (
        <Menu.Item
          key={item.value}
          title={item.label}
          onPress={() => {
            onSelect(item.value);
            onDismiss();
          }}
        />
      ))}
    </Menu>
  );
}
