import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PieChart } from "react-native-gifted-charts";
import { ScrollView, useColorScheme, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { PageHeader } from "@/components/PageHeader";
import { useAssets } from "@/data/controllers/useAssets";
import { useDebts } from "@/data/controllers/useDebts";
import { useInvestments } from "@/data/controllers/useInvestments";
import { useNetWorth } from "@/data/controllers/useNetWorth";
import { useUsdToInr } from "@/hooks/useExchangeRate";
import { formatCurrency } from "@/utils/currency";
import { getUniqueTypes } from "@/utils/string";
import { convertToInr } from "@/utils/stockPrice";
import { BreakdownCard, CARD_COLORS } from "@/components/NetWorth/BreakdownCard";
import { RecentUpdateRow } from "@/components/NetWorth/RecentUpdateRow";

export default function NetWorthScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";
  const { assets } = useAssets();
  const { investments } = useInvestments();
  const { debts } = useDebts();
  const { totalAssets, totalDebts, recentUpdates, isLoading } = useNetWorth();
  const { rate: usdToInr } = useUsdToInr();

  const fx = usdToInr ?? 84;
  const totalInvestments = investments.reduce(
    (sum, i) => sum + convertToInr(i.currentValue, i.currency ?? "INR", fx),
    0,
  );
  const netWorth = totalAssets + totalInvestments - totalDebts;

  const gross = totalAssets + totalInvestments + totalDebts;
  const assetsPct = gross > 0 ? (totalAssets / gross) * 100 : 0;
  const investPct = gross > 0 ? (totalInvestments / gross) * 100 : 0;
  const debtPct = gross > 0 ? (totalDebts / gross) * 100 : 0;

  const pieData =
    gross > 0
      ? [
          { value: assetsPct, color: "#6dd58c" },
          { value: investPct, color: "#a8c7fa" },
          { value: debtPct, color: "#ffb4ab" },
        ].filter((d) => d.value > 0)
      : [{ value: 1, color: theme.colors.surfaceVariant }];

  const assetPalette = isDark ? CARD_COLORS.assets.dark : CARD_COLORS.assets.light;
  const investPalette = isDark ? CARD_COLORS.investments.dark : CARD_COLORS.investments.light;
  const debtPalette = isDark ? CARD_COLORS.debts.dark : CARD_COLORS.debts.light;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="px-4 pt-2 pb-4 mt-8">
        {/* ── Header ── */}
        <PageHeader title="Net Worth" />

        {/* ── Donut chart card ── */}
        <View
          className="items-center py-6 rounded-3xl mb-6"
          style={{ backgroundColor: theme.colors.elevation.level1 }}
        >
          <PieChart
            donut
            data={pieData}
            radius={110}
            innerRadius={72}
            showText={false}
            strokeWidth={0}
            innerCircleColor={theme.colors.elevation.level1}
            centerLabelComponent={() => (
              <View className="items-center">
                <Text
                  className="text-[11px] font-medium mb-0.5"
                  style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}
                >
                  Total
                </Text>
                <Text
                  className="text-[22px] font-bold"
                  style={{ color: theme.colors.onSurface, letterSpacing: -0.5 }}
                >
                  {isLoading ? "—" : formatCurrency(netWorth)}
                </Text>
              </View>
            )}
          />

          {/* Legend */}
          <View className="flex-row gap-3 mt-6 flex-wrap justify-center">
            {[
              { color: "#6dd58c", label: "Assets" },
              { color: "#a8c7fa", label: "Invest" },
              { color: "#ffb4ab", label: "Debts" },
            ].map(({ color, label }) => (
              <View
                key={label}
                className="flex-row items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)",
                }}
              >
                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <Text
                  className="text-[13px] font-medium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Breakdown section ── */}
        <Text
          className="text-[13px] font-medium mb-3 ml-1"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          Breakdown
        </Text>

        <BreakdownCard
          label="Assets"
          icon="home-city"
          backgroundIcon="bank"
          amount={totalAssets}
          pct={assetsPct}
          subtitle={getUniqueTypes(assets)}
          palette={assetPalette}
          onPress={() => router.push("/(screens)/(net-worth)/(assets)")}
        />
        <BreakdownCard
          label="Investments"
          icon="finance"
          backgroundIcon="chart-line"
          amount={totalInvestments}
          pct={investPct}
          subtitle={getUniqueTypes(investments)}
          palette={investPalette}
          onPress={() => router.push("/(screens)/(net-worth)/(investments)")}
        />
        <BreakdownCard
          label="Debts"
          icon="credit-card-check"
          backgroundIcon="credit-card-off"
          amount={totalDebts}
          pct={debtPct}
          subtitle={getUniqueTypes(debts)}
          palette={debtPalette}
          isDebt
          onPress={() => router.push("/(screens)/(net-worth)/(debts)")}
        />

        {/* ── Recent updates ── */}
        {recentUpdates.length > 0 && (
          <View className="mt-4">
            <Text
              className="text-[13px] font-medium mb-3 px-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Recent Valuation Updates
            </Text>
            <View
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: theme.colors.elevation.level2 }}
            >
              {recentUpdates.map((item, index) => (
                <RecentUpdateRow
                  key={item.id}
                  item={item}
                  isLast={index === recentUpdates.length - 1}
                  onSurfaceColor={theme.colors.onSurface}
                  mutedColor={theme.colors.onSurfaceVariant}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Empty state ── */}
        {!isLoading && gross === 0 && (
          <View className="items-center py-8 mt-4">
            <MaterialCommunityIcons
              name="wallet-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
              style={{ opacity: 0.5 }}
            />
            <Text
              className="mt-3 text-center text-sm"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              No assets, investments, or debts yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
