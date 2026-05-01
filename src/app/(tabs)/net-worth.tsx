import { MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart } from "react-native-gifted-charts";
import {
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAssets } from "@/data/controllers/useAssets";
import { useDebts } from "@/data/controllers/useDebts";
import { useInvestments } from "@/data/controllers/useInvestments";
import { useNetWorth, type RecentUpdate } from "@/data/controllers/useNetWorth";

// ── Semantic card palette (mirrors the mockup) ────────────────────────────────
const CARD_COLORS = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatFullCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getUniqueTypes(items: Array<{ type: string }>): string {
  if (items.length === 0) return "No items yet";
  const unique = [...new Set(items.map((i) => capitalise(i.type)))];
  return unique.slice(0, 3).join(" • ");
}

function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────
function BreakdownCard({
  label,
  icon,
  backgroundIcon,
  amount,
  pct,
  subtitle,
  palette,
  isDebt,
}: {
  label: string;
  icon: string;
  backgroundIcon: string;
  amount: number;
  pct: number;
  subtitle: string;
  palette: { bg: string; text: string; accent: string };
  isDebt?: boolean;
}) {
  const displayAmount = isDebt ? -amount : amount;
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={{
        backgroundColor: palette.bg,
        borderRadius: 28,
        padding: 20,
        marginBottom: 12,
        overflow: "hidden",
      }}
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

      <View className="flex-col gap-6">
        {/* Top row: icon + percentage badge */}
        <View className="flex-row justify-between items-start">
          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.08)",
              borderRadius: 16,
              width: 48,
              height: 48,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={palette.text}
            />
          </View>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: palette.text, fontSize: 12, fontWeight: "700" }}>
              {pct.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Bottom: label + amount + type list */}
        <View>
          <Text
            style={{ color: palette.text, fontSize: 14, fontWeight: "500", opacity: 0.8, marginBottom: 4 }}
          >
            {label}
          </Text>
          <Text style={{ color: palette.text, fontSize: 30, fontWeight: "400" }}>
            {formatFullCurrency(displayAmount)}
          </Text>
          <Text
            style={{ color: palette.text, fontSize: 12, fontWeight: "500", opacity: 0.7, marginTop: 6 }}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecentUpdateRow({
  item,
  isLast,
  onSurfaceColor,
  mutedColor,
}: {
  item: RecentUpdate;
  isLast: boolean;
  onSurfaceColor: string;
  mutedColor: string;
}) {
  const iconMeta: Record<
    RecentUpdate["type"],
    { icon: string; iconBg: string; iconColor: string }
  > = {
    asset: {
      icon: "bank",
      iconBg: "rgba(100,149,237,0.15)",
      iconColor: "#4a90d9",
    },
    investment: {
      icon: "trending-up",
      iconBg: "rgba(109,213,140,0.15)",
      iconColor: "#2e7d32",
    },
    debt: {
      icon: "credit-card",
      iconBg: "rgba(255,180,171,0.2)",
      iconColor: "#c62828",
    },
  };
  const meta = iconMeta[item.type];

  return (
    <View>
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: pressed ? "rgba(0,0,0,0.04)" : "transparent",
        })}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: meta.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name={meta.icon as any}
            size={20}
            color={meta.iconColor}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{ color: onSurfaceColor, fontSize: 15, fontWeight: "400" }}
          >
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{ color: mutedColor, fontSize: 12, marginTop: 2 }}
          >
            {capitalise(item.type)} • {formatRelativeDate(item.updatedAt)}
          </Text>
        </View>
        <Text style={{ color: mutedColor, fontSize: 12 }}>
          {capitalise(item.itemType)}
        </Text>
      </Pressable>
      {!isLast && (
        <View style={{ height: 1, backgroundColor: "rgba(128,128,128,0.1)", marginLeft: 72 }} />
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function NetWorthScreen() {
  const theme = useTheme();
  const isDark = useColorScheme() === "dark";
  const { assets } = useAssets();
  const { investments } = useInvestments();
  const { debts } = useDebts();
  const { totalAssets, totalInvestments, totalDebts, netWorth, recentUpdates, isLoading } =
    useNetWorth();

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
        <View className="h-16 flex-row items-center justify-between">
          <Text
            className="text-4xl font-medium"
            style={{ color: theme.colors.onSurface }}
          >
            Net Worth
          </Text>
        </View>

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
                  style={{
                    fontSize: 11,
                    color: theme.colors.onSurfaceVariant,
                    fontWeight: "500",
                    letterSpacing: 0.5,
                    marginBottom: 2,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: theme.colors.onSurface,
                    letterSpacing: -0.5,
                  }}
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
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.04)",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <View
                  style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }}
                />
                <Text style={{ fontSize: 13, fontWeight: "500", color: theme.colors.onSurfaceVariant }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Breakdown section ── */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: theme.colors.onSurfaceVariant,
            marginBottom: 12,
            marginLeft: 4,
          }}
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
        />

        <BreakdownCard
          label="Investments"
          icon="finance"
          backgroundIcon="chart-line"
          amount={totalInvestments}
          pct={investPct}
          subtitle={getUniqueTypes(investments)}
          palette={investPalette}
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
        />

        {/* ── Recent updates ── */}
        {recentUpdates.length > 0 && (
          <View className="mt-4">
            <View className="flex-row items-center justify-between mb-3 px-1">
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Recent Valuation Updates
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.elevation.level2,
                borderRadius: 24,
                overflow: "hidden",
              }}
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

        {/* Empty state */}
        {!isLoading && gross === 0 && (
          <View className="items-center py-8 mt-4">
            <MaterialCommunityIcons
              name="wallet-outline"
              size={48}
              color={theme.colors.onSurfaceVariant}
              style={{ opacity: 0.5 }}
            />
            <Text
              className="mt-3 text-center"
              style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}
            >
              No assets, investments, or debts yet.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
