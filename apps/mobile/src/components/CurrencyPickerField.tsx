import { useState } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { Chip, TextInput, useTheme } from "react-native-paper";

const MAJOR_CURRENCIES = [
  "INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY", "CAD", "AUD", "CHF",
];

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function CurrencyPickerField({ value, onChangeText, label = "Currency", style }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  const suggestions = focused
    ? MAJOR_CURRENCIES.filter((c) =>
        c.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  return (
    <View style={style}>
      <TextInput
        label={label}
        value={value}
        onChangeText={(t) => onChangeText(t.toUpperCase())}
        onFocus={() => setFocused(true)}
        // 150ms delay lets Chip onPress fire before suggestions hide on native
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        mode="outlined"
        autoCapitalize="characters"
        maxLength={10}
        style={{ backgroundColor: theme.colors.elevation.level2 }}
      />
      {suggestions.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-2">
          {suggestions.map((c) => (
            <Chip
              key={c}
              compact
              selected={value === c}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Select ${c}`}
              onPress={() => {
                onChangeText(c);
                setFocused(false);
              }}
            >
              {c}
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}
