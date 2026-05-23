// src/components/NetWorth/Investments/PurchaseRow.tsx
import Investment from '@/data/models/Investment';
import { formatCurrency } from '@/utils/currency';
import { effectiveCurrentValue } from '@/utils/investment';
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type PurchaseRowProps = {
  investment: Investment;
  isFirst: boolean;
  toInr: (amount: number, currency?: string) => number;
};

export function PurchaseRow({ investment: inv, isFirst, toInr }: PurchaseRowProps) {
  const theme = useTheme();
  const router = useRouter();

  const currentVal = toInr(effectiveCurrentValue(inv), inv.currency);
  const invested = toInr(inv.investedAmount, inv.currency);
  const gain = currentVal - invested;
  const gainColor = gain >= 0 ? '#6dd58c' : theme.colors.error;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: '/(screens)/(net-worth)/(investments)/[id]',
          params: { id: inv.id },
        })
      }
      className="flex-row justify-between items-center px-4 py-3"
      style={{
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-1 mr-3">
        <Text className="text-sm" style={{ color: theme.colors.onSurface }}>
          {inv.platform ?? inv.name}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: theme.colors.onSurfaceVariant }}>
          {[
            inv.quantity != null ? `Qty: ${inv.quantity}` : null,
            invested > 0
              ? `Invested: ${formatCurrency(invested)}`
              : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
          {formatCurrency(currentVal)}
        </Text>
        {inv.currentValue > 0 ? (
          <Text className="text-xs mt-0.5" style={{ color: gainColor }}>
            {`${gain >= 0 ? '+' : ''}${formatCurrency(Math.abs(gain))}`}
          </Text>
        ) : (
          <View
            className="mt-0.5 px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(168,199,250,0.15)' }}
          >
            <Text className="text-xs font-medium" style={{ color: '#a8c7fa' }}>
              Invested
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
