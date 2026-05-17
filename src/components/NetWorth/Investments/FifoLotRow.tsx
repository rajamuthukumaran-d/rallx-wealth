// src/components/NetWorth/Investments/FifoLotRow.tsx
import Investment from '@/data/models/Investment';
import { formatCurrency } from '@/utils/currency';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export type FifoLotPreview = {
  lot: Investment;
  unitsReduced?: number;
  amountReduced?: number;
  fullyConsumed: boolean;
};

function formatUnits(qty: number) {
  return qty % 1 === 0 ? qty.toFixed(0) : qty.toFixed(4);
}

type FifoLotRowProps = {
  item: FifoLotPreview;
  isFirst: boolean;
  currencySymbol: string;
};

export function FifoLotRow({ item, isFirst, currencySymbol }: FifoLotRowProps) {
  const theme = useTheme();
  return (
    <View
      className="flex-row justify-between items-center py-2"
      style={{
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <View className="flex-1 mr-3">
        <Text className="text-xs font-medium" style={{ color: theme.colors.onSurface }}>
          {new Date(item.lot.createdAt as any).toLocaleDateString()}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: theme.colors.onSurfaceVariant }}>
          {[
            item.lot.quantity != null ? `${formatUnits(item.lot.quantity)} units` : null,
            `${formatCurrency(item.lot.investedAmount, currencySymbol)} invested`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
      <View className="items-end gap-1">
        <View
          className="px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: item.fullyConsumed
              ? 'rgba(255,180,171,0.2)'
              : 'rgba(255,213,79,0.15)',
          }}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: item.fullyConsumed ? '#ffb4ab' : '#ffd54f' }}
          >
            {item.fullyConsumed ? 'Fully Sold' : 'Partial'}
          </Text>
        </View>
        <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
          {item.unitsReduced !== undefined
            ? `−${formatUnits(item.unitsReduced)} units`
            : item.amountReduced !== undefined
              ? `−${formatCurrency(item.amountReduced, currencySymbol)}`
              : ''}
        </Text>
      </View>
    </View>
  );
}
