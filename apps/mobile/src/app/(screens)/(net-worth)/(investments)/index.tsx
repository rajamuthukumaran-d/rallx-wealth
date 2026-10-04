import { groupBySymbol, groupByType, formatCurrency, convertToInr } from "@rallx-wealth/utils-frontend";
// src/app/(screens)/(net-worth)/(investments)/index.tsx
import { ScreenHeader } from '@/components/ScreenHeader';
import { SummaryCard } from '@/components/NetWorth/Investments/SummaryCard';
import { SymbolRow } from '@/components/NetWorth/Investments/SymbolRow';
import {
  refreshInvestmentPrices,
  useInvestments,
} from '@/data/controllers/useInvestments';
import { useExchangeRate } from '@/context/ExchangeRateContext';
import { effectiveCurrentValue } from "@rallx-wealth/utils-database";
import { useSlideReveal } from '@/hooks/useSlideReveal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';

type TypeConfig = {
  icon: string;
  label: string;
  bgColor: string;
  iconColor: string;
};

const TYPE_CONFIG_MAP: Record<string, TypeConfig> = {
  stock: { icon: 'chart-line', label: 'Stocks', bgColor: 'rgba(168,199,250,0.2)', iconColor: '#a8c7fa' },
  mutual_fund: { icon: 'chart-donut', label: 'Mutual Funds', bgColor: 'rgba(115,219,145,0.2)', iconColor: '#73db91' },
  crypto: { icon: 'currency-btc', label: 'Crypto', bgColor: 'rgba(255,180,171,0.2)', iconColor: '#ffb4ab' },
  etf: { icon: 'finance', label: 'ETFs', bgColor: 'rgba(187,199,219,0.2)', iconColor: '#bbc7db' },
  bonds: { icon: 'bank', label: 'Bonds', bgColor: 'rgba(165,142,251,0.2)', iconColor: '#a58efb' },
  gold: { icon: 'gold', label: 'Gold', bgColor: 'rgba(255,193,7,0.2)', iconColor: '#ffc107' },
  silver: { icon: 'silverware', label: 'Silver', bgColor: 'rgba(176,190,197,0.2)', iconColor: '#b0bec5' },
};

const FALLBACK_PALETTE: Omit<TypeConfig, 'label'>[] = [
  { icon: 'chart-line', bgColor: 'rgba(168,199,250,0.2)', iconColor: '#a8c7fa' },
  { icon: 'chart-donut', bgColor: 'rgba(115,219,145,0.2)', iconColor: '#73db91' },
  { icon: 'currency-btc', bgColor: 'rgba(255,180,171,0.2)', iconColor: '#ffb4ab' },
  { icon: 'finance', bgColor: 'rgba(187,199,219,0.2)', iconColor: '#bbc7db' },
  { icon: 'bank', bgColor: 'rgba(165,142,251,0.2)', iconColor: '#a58efb' },
];

function getTypeConfig(type: string, index: number): TypeConfig {
  const key = type.toLowerCase();
  if (TYPE_CONFIG_MAP[key]) return TYPE_CONFIG_MAP[key];
  const fallback = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  return { ...fallback, label: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) };
}

export default function InvestmentsBreakdownScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { investments, isLoading } = useInvestments();
  const { usdToInr } = useExchangeRate();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getRevealAnim, toggleReveal } = useSlideReveal();

  const investmentSignature = investments
    .map((i) => `${i.id}:${i.symbol ?? ''}:${i.exchange ?? ''}:${i.quantity ?? ''}`)
    .sort()
    .join('|');
  const prevSignature = useRef<string | null>(null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshInvestmentPrices(investments);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (prevSignature.current === investmentSignature) return;
    prevSignature.current = investmentSignature;
    if (!investments.some((i) => i.symbol && i.exchange)) return;
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentSignature, isLoading]);

  const fx = usdToInr ?? 84;
  const toInr = (amount: number, currency?: string) =>
    convertToInr(amount, currency ?? 'INR', fx);

  const totalCurrentValue = investments.reduce(
    (s, i) => s + toInr(effectiveCurrentValue(i), i.currency),
    0,
  );
  const totalInvested = investments.reduce(
    (s, i) => s + toInr(i.investedAmount, i.currency),
    0,
  );

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const typeGroups = groupByType(investments);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Investments" isTransparent />,
        }}
      />
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <SummaryCard
            totalCurrentValue={totalCurrentValue}
            totalInvested={totalInvested}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />

          <View className="px-4 mt-3 gap-3">
            {typeGroups.map(([type, typeInvestments], idx) => {
              const config = getTypeConfig(type, idx);
              const typeCurrentValue = typeInvestments.reduce(
                (s, i) => s + toInr(effectiveCurrentValue(i), i.currency),
                0,
              );
              const typeInvested = typeInvestments.reduce(
                (s, i) => s + toInr(i.investedAmount, i.currency),
                0,
              );
              const typeGain = typeCurrentValue - typeInvested;
              const symbolGroups = groupBySymbol(typeInvestments);

              return (
                <View
                  key={type}
                  className="rounded-3xl p-5 overflow-hidden"
                  style={{ backgroundColor: theme.colors.elevation.level2 }}
                >
                  {/* Watermark */}
                  <MaterialCommunityIcons
                    name={config.icon as any}
                    size={120}
                    color={theme.colors.onSurface}
                    style={{ position: 'absolute', bottom: -16, right: -16, opacity: 0.05 }}
                  />

                  {/* Card header */}
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: config.bgColor }}
                      >
                        <MaterialCommunityIcons
                          name={config.icon as any}
                          size={20}
                          color={config.iconColor}
                        />
                      </View>
                      <Text className="text-base font-medium" style={{ color: theme.colors.onSurface }}>
                        {config.label}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium" style={{ color: theme.colors.onSurface }}>
                        {formatCurrency(typeCurrentValue)}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: typeGain >= 0 ? '#6dd58c' : theme.colors.error }}
                      >
                        {`${typeGain >= 0 ? '+' : ''}${formatCurrency(Math.abs(typeGain))}`}
                      </Text>
                    </View>
                  </View>

                  {/* Symbol rows */}
                  {symbolGroups.map(([symKey, symInvestments], sIdx) => {
                    const expandKey = `${type}:${symKey}`;
                    return (
                      <SymbolRow
                        key={symKey}
                        symKey={symKey}
                        symInvestments={symInvestments}
                        type={type}
                        showTopBorder={sIdx > 0}
                        isExpanded={expanded.has(expandKey)}
                        revealAnim={getRevealAnim(expandKey)}
                        onToggleReveal={() => toggleReveal(expandKey)}
                        onToggleExpand={() => toggleExpanded(expandKey)}
                        toInr={toInr}
                      />
                    );
                  })}
                </View>
              );
            })}

            {!isLoading && investments.length === 0 && (
              <View className="items-center py-16">
                <MaterialCommunityIcons
                  name="chart-line"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                  style={{ opacity: 0.4 }}
                />
                <Text
                  className="mt-3 text-sm text-center"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  No investments yet. Add your first investment below.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <FAB
          icon="plus"
          style={{ position: 'absolute', right: 16, bottom: 32, backgroundColor: theme.colors.primary }}
          color={theme.colors.onPrimary}
          onPress={() =>
            router.push({
              pathname: '/(screens)/(net-worth)/(investments)/[id]',
              params: { id: 'new' },
            })
          }
        />
      </View>
    </>
  );
}
