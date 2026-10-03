import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "react-native-paper";
import type { RecentUpdate } from "@/data/controllers/useNetWorth";
import { formatRelativeDate, capitalise } from "@rallx-wealth/utils-frontend";

const ICON_META: Record<RecentUpdate["type"], { icon: string; iconBg: string; iconColor: string }> =
  {
    asset: { icon: "bank", iconBg: "rgba(100,149,237,0.15)", iconColor: "#4a90d9" },
    investment: { icon: "trending-up", iconBg: "rgba(109,213,140,0.15)", iconColor: "#2e7d32" },
    debt: { icon: "credit-card", iconBg: "rgba(255,180,171,0.2)", iconColor: "#c62828" },
  };

interface RecentUpdateRowProps {
  item: RecentUpdate;
  isLast: boolean;
  onSurfaceColor: string;
  mutedColor: string;
}

export function RecentUpdateRow({ item, isLast, onSurfaceColor, mutedColor }: RecentUpdateRowProps) {
  const meta = ICON_META[item.type];

  return (
    <View>
      <Pressable
        className="flex-row items-center gap-4 px-4 py-3.5"
        style={({ pressed }) => ({
          backgroundColor: pressed ? "rgba(0,0,0,0.04)" : "transparent",
        })}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: meta.iconBg }}
        >
          <MaterialCommunityIcons name={meta.icon as any} size={20} color={meta.iconColor} />
        </View>
        <View className="flex-1 min-w-0">
          <Text numberOfLines={1} className="text-[15px] font-normal" style={{ color: onSurfaceColor }}>
            {item.name}
          </Text>
          <Text numberOfLines={1} className="text-xs mt-0.5" style={{ color: mutedColor }}>
            {capitalise(item.type)} • {formatRelativeDate(item.updatedAt)}
          </Text>
        </View>
        <Text className="text-xs" style={{ color: mutedColor }}>
          {capitalise(item.itemType)}
        </Text>
      </Pressable>
      {!isLast && (
        <View className="h-px ml-[72px]" style={{ backgroundColor: "rgba(128,128,128,0.1)" }} />
      )}
    </View>
  );
}
