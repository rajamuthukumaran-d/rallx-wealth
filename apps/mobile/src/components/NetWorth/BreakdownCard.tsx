import { MaterialCommunityIcons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { formatFullCurrency } from "@/utils/currency";

export const CARD_COLORS = {
  assets: {
    light: { bg: "#c4eed0", text: "#072111", accent: "#6dd58c" },
    dark: { bg: "#20512f", text: "#c4eed0", accent: "#6dd58c" },
  },
  investments: {
    light: { bg: "#d3e3fd", text: "#041e49", accent: "#a8c7fa" },
    dark: { bg: "#244e87", text: "#d3e3fd", accent: "#a8c7fa" },
  },
  debts: {
    light: { bg: "#ffdad6", text: "#410002", accent: "#ffb4ab" },
    dark: { bg: "#93000a", text: "#ffdad6", accent: "#ffb4ab" },
  },
} as const;

export type CardPalette = { bg: string; text: string; accent: string };

interface BreakdownCardProps {
  label: string;
  icon: string;
  backgroundIcon: string;
  amount: number;
  pct: number;
  subtitle: string;
  palette: CardPalette;
  isDebt?: boolean;
  onPress?: () => void;
}

export function BreakdownCard({
  label,
  icon,
  backgroundIcon,
  amount,
  pct,
  subtitle,
  palette,
  isDebt,
  onPress,
}: BreakdownCardProps) {
  const displayAmount = isDebt ? -amount : amount;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      className="rounded-3xl p-5 mb-3 overflow-hidden"
      style={{ backgroundColor: palette.bg }}
    >
      {/* Watermark icon */}
      <MaterialCommunityIcons
        name={backgroundIcon as any}
        size={140}
        color={palette.text}
        style={{
          position: "absolute",
          bottom: -20,
          right: -20,
          opacity: 0.07,
          transform: [{ rotate: "12deg" }],
        }}
      />

      <View className="gap-6">
        {/* Icon + percentage badge */}
        <View className="flex-row justify-between items-start">
          <View
            className="rounded-2xl w-12 h-12 items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
          >
            <MaterialCommunityIcons name={icon as any} size={24} color={palette.text} />
          </View>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: "rgba(255,255,255,0.35)" }}
          >
            <Text className="text-xs font-bold" style={{ color: palette.text }}>
              {pct.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Label + amount + type list */}
        <View>
          <Text className="text-sm font-medium opacity-80 mb-1" style={{ color: palette.text }}>
            {label}
          </Text>
          <Text className="text-[30px] font-normal" style={{ color: palette.text }}>
            {formatFullCurrency(displayAmount)}
          </Text>
          <Text className="text-xs font-medium opacity-70 mt-1.5" style={{ color: palette.text }}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
