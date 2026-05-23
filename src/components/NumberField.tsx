import { formatIndian } from "@/utils/numberFormat";
import type { StyleProp, TextStyle } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
}

export function NumberField({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  style,
}: Props) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={(v) => onChangeText(formatIndian(v))}
      mode="outlined"
      keyboardType="decimal-pad"
      left={prefix ? <TextInput.Affix text={prefix} /> : undefined}
      right={suffix ? <TextInput.Affix text={suffix} /> : undefined}
      style={style}
    />
  );
}
