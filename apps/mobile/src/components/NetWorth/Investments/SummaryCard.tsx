// src/components/NetWorth/Investments/SummaryCard.tsx
import { formatFullCurrency } from "@rallx-wealth/utils-frontend";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type SummaryCardProps = {
  totalCurrentValue: number;
  totalInvested: number;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function SummaryCard({
  totalCurrentValue,
  totalInvested,
  isLoading,
  isRefreshing,
  onRefresh,
}: SummaryCardProps) {
  const theme = useTheme();

  const gainLoss = totalCurrentValue - totalInvested;
  const gainLossColor = gainLoss >= 0 ? '#6dd58c' : theme.colors.error;
  const prefix = gainLoss >= 0 ? '+' : '';
  const gainLossPct =
    totalInvested > 0
      ? `${prefix}${(((totalCurrentValue - totalInvested) / totalInvested) * 100).toFixed(1)}%`
      : '—';

  return (
    <View
      className="mx-4 mt-4 rounded-3xl p-5"
      style={{ backgroundColor: theme.colors.elevation.level2 }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-medium" style={{ color: theme.colors.onSurfaceVariant }}>
          Current Value
        </Text>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={isRefreshing}
          className="w-8 h-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          {isRefreshing ? (
            <ActivityIndicator size={16} color={theme.colors.onSurfaceVariant} />
          ) : (
            <MaterialCommunityIcons name="refresh" size={18} color={theme.colors.onSurfaceVariant} />
          )}
        </TouchableOpacity>
      </View>

      <Text className="text-4xl font-normal mb-4" style={{ color: theme.colors.onSurface }}>
        {isLoading ? '—' : formatFullCurrency(totalCurrentValue)}
      </Text>

      <View
        className="flex-row justify-between pt-4"
        style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}
      >
        <View>
          <Text className="text-xs font-medium mb-0.5" style={{ color: theme.colors.onSurfaceVariant }}>
            Total Invested
          </Text>
          <Text className="text-base font-medium" style={{ color: theme.colors.onSurface }}>
            {isLoading ? '—' : formatFullCurrency(totalInvested)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-medium mb-0.5" style={{ color: theme.colors.onSurfaceVariant }}>
            Total Gain/Loss
          </Text>
          <Text className="text-base font-medium" style={{ color: gainLossColor }}>
            {isLoading ? '—' : gainLossPct}
          </Text>
        </View>
      </View>
    </View>
  );
}
