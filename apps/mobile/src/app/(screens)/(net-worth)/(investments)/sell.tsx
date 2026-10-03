import { planInvestmentSale } from "@rallx-wealth/utils-database";
// src/app/(screens)/(net-worth)/(investments)/sell.tsx
import { ScreenHeader } from '@/components/ScreenHeader';
import { FifoLotRow, FifoLotPreview } from '@/components/NetWorth/Investments/FifoLotRow';
import { SectionCard } from '@/components/SectionCard';
import {
  SellInvestmentData,
  sellInvestment,
  useInvestmentGroup,
} from '@/data/controllers/useInvestments';
import Investment from '@/data/models/Investment';
import { formatCurrency, getCurrencySymbol, formatUnits } from "@rallx-wealth/utils-frontend";
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput, useTheme } from 'react-native-paper';

function computeFifoPreview(
  lots: Investment[],
  unitsSold: number | undefined,
  soldAmount: number | undefined,
): FifoLotPreview[] {
  return planInvestmentSale(lots, { unitsSold, soldAmount }).map(
    ({ lot, unitsReduced, amountReduced, fullyConsumed }) => ({ lot, unitsReduced, amountReduced, fullyConsumed }),
  );
}

export default function SellInvestmentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { symbol, name, investmentType } = useLocalSearchParams<{
    symbol: string;
    name: string;
    investmentType: string;
  }>();

  const { investments: lots, isLoading } = useInvestmentGroup(symbol || undefined, name);

  const [unitsSoldStr, setUnitsSoldStr] = useState('');
  const [soldAmountStr, setSoldAmountStr] = useState('');
  const [saving, setSaving] = useState(false);

  const unitsSold = unitsSoldStr ? parseFloat(unitsSoldStr) : undefined;
  const soldAmount = soldAmountStr ? parseFloat(soldAmountStr) : undefined;

  const hasAtLeastOne =
    (unitsSold !== undefined && !isNaN(unitsSold) && unitsSold > 0) ||
    (soldAmount !== undefined && !isNaN(soldAmount) && soldAmount > 0);

  const totalUnits = lots.reduce((sum, l) => sum + (l.quantity ?? 0), 0);
  const totalInvested = lots.reduce((sum, l) => sum + l.investedAmount, 0);
  const totalCurrentValue = lots.reduce((sum, l) => sum + (l.currentValue ?? 0), 0);

  const lotCurrency = lots[0]?.currency ?? 'INR';
  const currencySymbol = getCurrencySymbol(lotCurrency);

  const preview = useMemo(
    () => computeFifoPreview(lots, unitsSold, soldAmount),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lots, unitsSoldStr, soldAmountStr],
  );

  const estimatedPnL = useMemo(() => {
    if (soldAmount && soldAmount > 0 && unitsSold && unitsSold > 0 && totalUnits > 0 && totalInvested > 0) {
      const costBasis = (unitsSold / totalUnits) * totalInvested;
      return soldAmount - costBasis;
    }
    return null;
  }, [soldAmount, unitsSold, totalUnits, totalInvested]);

  const handleSell = async () => {
    if (!hasAtLeastOne || saving) return;
    setSaving(true);
    try {
      const payload: SellInvestmentData = {
        symbol: symbol || undefined,
        name,
        unitsSold: unitsSold && unitsSold > 0 ? unitsSold : undefined,
        soldAmount: soldAmount && soldAmount > 0 ? soldAmount : undefined,
      };
      await sellInvestment(payload);
      router.back();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  const displayName = symbol ? `${name} (${symbol})` : name;
  const typeLabel = investmentType
    ? investmentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScreenHeader title="Sell / Redeem" />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Investment Summary */}
              <SectionCard className="gap-3 mb-4">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-base font-semibold" style={{ color: theme.colors.onSurface }}>
                    {displayName}
                  </Text>
                  {typeLabel ? (
                    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(168,199,250,0.15)' }}>
                      <Text className="text-xs" style={{ color: '#a8c7fa' }}>
                        {typeLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View className="flex-row gap-6">
                  {totalUnits > 0 && (
                    <View>
                      <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                        Total Units
                      </Text>
                      <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                        {formatUnits(totalUnits)}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                      Invested
                    </Text>
                    <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                      {formatCurrency(totalInvested, currencySymbol)}
                    </Text>
                  </View>
                  {totalCurrentValue > 0 && (
                    <View>
                      <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                        Current
                      </Text>
                      <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                        {formatCurrency(totalCurrentValue, currencySymbol)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                  {lots.length} lot{lots.length !== 1 ? 's' : ''} held · FIFO order
                </Text>
              </SectionCard>

              {/* Sale Details */}
              <SectionCard className="gap-3 mb-4">
                <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                  Sale Details
                </Text>
                <Text className="text-xs mb-1" style={{ color: theme.colors.onSurfaceVariant }}>
                  Enter units sold, amount received, or both. At least one is required.
                </Text>
                <TextInput
                  label="Units Sold"
                  value={unitsSoldStr}
                  onChangeText={setUnitsSoldStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={{ backgroundColor: theme.colors.elevation.level2 }}
                  right={<TextInput.Affix text="units" />}
                />
                <TextInput
                  label="Amount Received"
                  value={soldAmountStr}
                  onChangeText={setSoldAmountStr}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={{ backgroundColor: theme.colors.elevation.level2 }}
                  left={<TextInput.Affix text="₹" />}
                />
                {estimatedPnL !== null && (
                  <View className="p-3 rounded-2xl" style={{ backgroundColor: 'rgba(168,199,250,0.08)' }}>
                    <Text className="text-xs" style={{ color: theme.colors.onSurfaceVariant }}>
                      Estimated P&L
                    </Text>
                    <Text
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: estimatedPnL >= 0 ? '#6dd58c' : theme.colors.error }}
                    >
                      {estimatedPnL >= 0 ? '+' : ''}
                      {formatCurrency(estimatedPnL, currencySymbol)}
                    </Text>
                  </View>
                )}
              </SectionCard>

              {/* FIFO Preview */}
              {preview.length > 0 && (
                <SectionCard className="gap-1 mb-4">
                  <Text className="text-sm font-medium mb-2" style={{ color: theme.colors.onSurface }}>
                    Lots Affected (FIFO)
                  </Text>
                  {preview.map((item, idx) => (
                    <FifoLotRow
                      key={item.lot.id}
                      item={item}
                      isFirst={idx === 0}
                      currencySymbol={currencySymbol}
                    />
                  ))}
                </SectionCard>
              )}

              <Button
                mode="contained"
                className="rounded-full py-1"
                onPress={handleSell}
                loading={saving}
                disabled={!hasAtLeastOne || saving}
              >
                Record Sale
              </Button>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </>
  );
}
