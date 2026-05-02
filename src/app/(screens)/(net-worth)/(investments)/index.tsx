import { ScreenHeader } from "@/components/ScreenHeader";
import { useInvestments } from "@/data/controllers/useInvestments";
import Investment from "@/data/models/Investment";
import { formatCurrency, formatFullCurrency } from "@/utils/currency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";

type TypeConfig = { icon: string; label: string; bgColor: string; iconColor: string };

const TYPE_CONFIG_MAP: Record<string, TypeConfig> = {
  stock: {
    icon: "chart-line",
    label: "Stocks",
    bgColor: "rgba(168,199,250,0.2)",
    iconColor: "#a8c7fa",
  },
  mutual_fund: {
    icon: "chart-donut",
    label: "Mutual Funds",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  crypto: {
    icon: "currency-btc",
    label: "Crypto",
    bgColor: "rgba(255,180,171,0.2)",
    iconColor: "#ffb4ab",
  },
  etf: {
    icon: "finance",
    label: "ETFs",
    bgColor: "rgba(187,199,219,0.2)",
    iconColor: "#bbc7db",
  },
  bonds: {
    icon: "bank",
    label: "Bonds",
    bgColor: "rgba(165,142,251,0.2)",
    iconColor: "#a58efb",
  },
};

const FALLBACK_PALETTE: Omit<TypeConfig, "label">[] = [
  { icon: "chart-line", bgColor: "rgba(168,199,250,0.2)", iconColor: "#a8c7fa" },
  { icon: "chart-donut", bgColor: "rgba(115,219,145,0.2)", iconColor: "#73db91" },
  { icon: "currency-btc", bgColor: "rgba(255,180,171,0.2)", iconColor: "#ffb4ab" },
  { icon: "finance", bgColor: "rgba(187,199,219,0.2)", iconColor: "#bbc7db" },
  { icon: "bank", bgColor: "rgba(165,142,251,0.2)", iconColor: "#a58efb" },
];

function getTypeConfig(type: string, index: number): TypeConfig {
  const key = type.toLowerCase();
  if (TYPE_CONFIG_MAP[key]) return TYPE_CONFIG_MAP[key];
  const fallback = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  return {
    ...fallback,
    label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}

function groupByType(investments: Investment[]): [string, Investment[]][] {
  const map: Record<string, Investment[]> = {};
  for (const inv of investments) {
    if (!map[inv.type]) map[inv.type] = [];
    map[inv.type].push(inv);
  }
  return Object.entries(map);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function InvestmentsBreakdownScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { investments, totalInvested, totalCurrentValue, totalGainLoss, isLoading } =
    useInvestments();
  const groups = groupByType(investments);

  const gainLossColor =
    totalGainLoss >= 0 ? "#6dd58c" : theme.colors.error;
  const gainLossPrefix = totalGainLoss >= 0 ? "+" : "";
  const gainLossPct =
    totalInvested > 0
      ? `${gainLossPrefix}${(((totalCurrentValue - totalInvested) / totalInvested) * 100).toFixed(1)}%`
      : "—";

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
          {/* Summary card */}
          <View
            className="mx-4 mt-4 rounded-3xl p-5"
            style={{ backgroundColor: theme.colors.elevation.level2 }}
          >
            <Text
              className="text-sm font-medium mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Current Value
            </Text>
            <Text
              className="text-4xl font-normal mb-4"
              style={{ color: theme.colors.onSurface }}
            >
              {isLoading ? "—" : formatFullCurrency(totalCurrentValue)}
            </Text>
            <View
              className="flex-row justify-between pt-4"
              style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" }}
            >
              <View>
                <Text
                  className="text-xs font-medium mb-0.5"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Total Invested
                </Text>
                <Text
                  className="text-base font-medium"
                  style={{ color: theme.colors.onSurface }}
                >
                  {isLoading ? "—" : formatFullCurrency(totalInvested)}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-xs font-medium mb-0.5"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Total Gain/Loss
                </Text>
                <Text className="text-base font-medium" style={{ color: gainLossColor }}>
                  {isLoading ? "—" : gainLossPct}
                </Text>
              </View>
            </View>
          </View>

          {/* Investment type cards */}
          <View className="px-4 mt-3 gap-3">
            {groups.map(([type, typeInvestments], idx) => {
              const config = getTypeConfig(type, idx);
              const typeCurrentValue = typeInvestments.reduce(
                (sum, i) => sum + i.currentValue,
                0,
              );
              const typeInvested = typeInvestments.reduce(
                (sum, i) => sum + i.investedAmount,
                0,
              );
              const typeGain = typeCurrentValue - typeInvested;
              const typeGainColor = typeGain >= 0 ? "#6dd58c" : theme.colors.error;

              return (
                <View
                  key={type}
                  className="rounded-3xl p-5 overflow-hidden"
                  style={{ backgroundColor: theme.colors.elevation.level2 }}
                >
                  {/* Watermark icon */}
                  <MaterialCommunityIcons
                    name={config.icon as any}
                    size={120}
                    color={theme.colors.onSurface}
                    style={{ position: "absolute", bottom: -16, right: -16, opacity: 0.05 }}
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
                      <Text
                        className="text-base font-medium"
                        style={{ color: theme.colors.onSurface }}
                      >
                        {config.label}
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {formatCurrency(typeCurrentValue)}
                    </Text>
                  </View>

                  {/* Individual investment rows */}
                  {typeInvestments.map((inv, iIdx) => {
                    const gain = inv.currentValue - inv.investedAmount;
                    const gainColor = gain >= 0 ? "#6dd58c" : theme.colors.error;
                    const gainPrefix = gain >= 0 ? "+" : "";

                    return (
                      <TouchableOpacity
                        key={inv.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push({
                            pathname: "/(screens)/(net-worth)/(investments)/[id]",
                            params: { id: inv.id },
                          })
                        }
                        className="flex-row justify-between items-center py-3"
                        style={{
                          borderTopWidth: iIdx > 0 ? 1 : 0,
                          borderTopColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        {/* Avatar + name */}
                        <View className="flex-row items-center gap-3 flex-1 mr-3">
                          <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{
                              backgroundColor: theme.colors.elevation.level3,
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{ color: theme.colors.onSurface }}
                            >
                              {inv.symbol
                                ? inv.symbol.slice(0, 2).toUpperCase()
                                : getInitials(inv.name)}
                            </Text>
                          </View>
                          <View className="flex-1">
                            <Text
                              className="text-sm font-medium"
                              style={{ color: theme.colors.onSurface }}
                            >
                              {inv.name}
                              {inv.symbol ? ` (${inv.symbol})` : ""}
                            </Text>
                            <Text
                              className="text-xs mt-0.5"
                              style={{ color: theme.colors.onSurfaceVariant }}
                            >
                              {[inv.platform, inv.quantity != null ? `Qty: ${inv.quantity}` : null]
                                .filter(Boolean)
                                .join(" • ")}
                            </Text>
                          </View>
                        </View>

                        {/* Value + gain */}
                        <View className="items-end">
                          <Text
                            className="text-sm font-medium"
                            style={{ color: theme.colors.onSurface }}
                          >
                            {formatCurrency(inv.currentValue)}
                          </Text>
                          <Text className="text-xs mt-0.5" style={{ color: gainColor }}>
                            {`${gainPrefix}${formatCurrency(Math.abs(gain))}`}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {/* Empty state */}
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
          style={{
            position: "absolute",
            right: 16,
            bottom: 32,
            backgroundColor: theme.colors.primary,
          }}
          color={theme.colors.onPrimary}
          onPress={() =>
            router.push({
              pathname: "/(screens)/(net-worth)/(investments)/[id]",
              params: { id: "new" },
            })
          }
        />
      </View>
    </>
  );
}
