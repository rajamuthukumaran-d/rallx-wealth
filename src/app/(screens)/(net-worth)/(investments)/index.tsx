import { ScreenHeader } from "@/components/ScreenHeader";
import {
  refreshInvestmentPrices,
  useInvestments,
} from "@/data/controllers/useInvestments";
import Investment from "@/data/models/Investment";
import { useUsdToInr } from "@/hooks/useExchangeRate";
import { formatCurrency, formatFullCurrency } from "@/utils/currency";
import { convertToInr } from "@/utils/stockPrice";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";

type TypeConfig = {
  icon: string;
  label: string;
  bgColor: string;
  iconColor: string;
};

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
  gold: {
    icon: "gold",
    label: "Gold",
    bgColor: "rgba(255,193,7,0.2)",
    iconColor: "#ffc107",
  },
  silver: {
    icon: "silverware",
    label: "Silver",
    bgColor: "rgba(176,190,197,0.2)",
    iconColor: "#b0bec5",
  },
};

const FALLBACK_PALETTE: Omit<TypeConfig, "label">[] = [
  {
    icon: "chart-line",
    bgColor: "rgba(168,199,250,0.2)",
    iconColor: "#a8c7fa",
  },
  {
    icon: "chart-donut",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  {
    icon: "currency-btc",
    bgColor: "rgba(255,180,171,0.2)",
    iconColor: "#ffb4ab",
  },
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

// Groups investments within a type by symbol. No-symbol investments each get a unique solo key.
function groupBySymbol(investments: Investment[]): [string, Investment[]][] {
  const map: Record<string, Investment[]> = {};
  for (const inv of investments) {
    const key = inv.symbol ? inv.symbol.toUpperCase() : `__solo__${inv.id}`;
    if (!map[key]) map[key] = [];
    map[key].push(inv);
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

function effectiveCurrentValue(inv: Investment): number {
  return inv.currentValue > 0 ? inv.currentValue : inv.investedAmount;
}

export default function InvestmentsBreakdownScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { investments, isLoading } = useInvestments();
  const { rate: usdToInr } = useUsdToInr();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const revealAnimations = useRef<Record<string, Animated.Value>>({});

  // Stable signature: changes when symbol/exchange/quantity/id changes, but NOT on currentValue
  // updates — avoids an infinite refresh loop.
  const investmentSignature = investments
    .map(
      (i) =>
        `${i.id}:${i.symbol ?? ""}:${i.exchange ?? ""}:${i.quantity ?? ""}`,
    )
    .sort()
    .join("|");
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
    // Don't auto-refresh on initial mount if there are no eligible investments
    if (!investments.some((i) => i.symbol && i.exchange)) return;
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investmentSignature, isLoading]);

  const fx = usdToInr ?? 84;
  const toInr = (amount: number, currency?: string) =>
    convertToInr(amount, currency ?? "INR", fx);

  const totalCurrentValue = investments.reduce(
    (s, i) => s + toInr(effectiveCurrentValue(i), i.currency),
    0,
  );
  const totalInvested = investments.reduce(
    (s, i) => s + toInr(i.investedAmount, i.currency),
    0,
  );
  const totalGainLoss = totalCurrentValue - totalInvested;

  const gainLossColor = totalGainLoss >= 0 ? "#6dd58c" : theme.colors.error;
  const gainLossPrefix = totalGainLoss >= 0 ? "+" : "";
  const gainLossPct =
    totalInvested > 0
      ? `${gainLossPrefix}${(((totalCurrentValue - totalInvested) / totalInvested) * 100).toFixed(1)}%`
      : "—";

  const typeGroups = groupByType(investments);

  const getRevealAnim = (key: string) => {
    if (!revealAnimations.current[key]) {
      revealAnimations.current[key] = new Animated.Value(0);
    }
    return revealAnimations.current[key];
  };

  const toggleReveal = (key: string) => {
    const anim = getRevealAnim(key);
    if (revealedKey === key) {
      Animated.spring(anim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }).start();
      setRevealedKey(null);
    } else {
      if (revealedKey) {
        Animated.spring(getRevealAnim(revealedKey), {
          toValue: 0,
          useNativeDriver: true,
          tension: 120,
          friction: 14,
        }).start();
      }
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 120,
        friction: 14,
      }).start();
      setRevealedKey(key);
    }
  };

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Investments" isTransparent />,
        }}
      />
      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Summary card */}
          <View
            className="mx-4 mt-4 rounded-3xl p-5"
            style={{ backgroundColor: theme.colors.elevation.level2 }}
          >
            <View className="flex-row justify-between items-center mb-1">
              <Text
                className="text-sm font-medium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Current Value
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                disabled={isRefreshing}
                className="w-8 h-8 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                {isRefreshing ? (
                  <ActivityIndicator
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="refresh"
                    size={18}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              </TouchableOpacity>
            </View>
            <Text
              className="text-4xl font-normal mb-4"
              style={{ color: theme.colors.onSurface }}
            >
              {isLoading ? "—" : formatFullCurrency(totalCurrentValue)}
            </Text>
            <View
              className="flex-row justify-between pt-4"
              style={{
                borderTopWidth: 1,
                borderTopColor: "rgba(255,255,255,0.05)",
              }}
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
                <Text
                  className="text-base font-medium"
                  style={{ color: gainLossColor }}
                >
                  {isLoading ? "—" : gainLossPct}
                </Text>
              </View>
            </View>
          </View>

          {/* Type cards */}
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
                    style={{
                      position: "absolute",
                      bottom: -16,
                      right: -16,
                      opacity: 0.05,
                    }}
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
                    <View className="items-end">
                      <Text
                        className="text-sm font-medium"
                        style={{ color: theme.colors.onSurface }}
                      >
                        {formatCurrency(typeCurrentValue)}
                      </Text>
                      <Text
                        className="text-xs"
                        style={{
                          color: typeGain >= 0 ? "#6dd58c" : theme.colors.error,
                        }}
                      >
                        {`${typeGain >= 0 ? "+" : ""}${formatCurrency(Math.abs(typeGain))}`}
                      </Text>
                    </View>
                  </View>

                  {/* Symbol groups */}
                  {symbolGroups.map(([symKey, symInvestments], sIdx) => {
                    const isSolo = symKey.startsWith("__solo__");
                    const isGrouped = !isSolo && symInvestments.length > 1;
                    const expandKey = `${type}:${symKey}`;
                    const isOpen = expanded.has(expandKey);

                    const symCurrentValue = symInvestments.reduce(
                      (s, i) => s + toInr(effectiveCurrentValue(i), i.currency),
                      0,
                    );
                    const symInvested = symInvestments.reduce(
                      (s, i) => s + toInr(i.investedAmount, i.currency),
                      0,
                    );
                    const symGain = symCurrentValue - symInvested;
                    const symGainColor =
                      symGain >= 0 ? "#6dd58c" : theme.colors.error;
                    const symGainPrefix = symGain >= 0 ? "+" : "";
                    const symHasCurrentValue = symInvestments.some(
                      (i) => i.currentValue > 0,
                    );

                    const actionWidth = isGrouped ? 136 : 204;
                    const rep = symInvestments[0]; // representative investment for avatar/name
                    const mostRecent = isGrouped
                      ? [...symInvestments].sort(
                          (a, b) => (b.createdAt as number) - (a.createdAt as number),
                        )[0]
                      : rep;
                    const totalQty = symInvestments.reduce(
                      (s, i) => s + (i.quantity ?? 0),
                      0,
                    );

                    const avatarText = rep.symbol
                      ? rep.symbol.slice(0, 2).toUpperCase()
                      : getInitials(rep.name);

                    const displayName =
                      rep.name +
                      (rep.symbol && !isSolo ? ` (${rep.symbol})` : "");

                    return (
                      <View
                        key={symKey}
                        style={{
                          borderTopWidth: sIdx > 0 ? 1 : 0,
                          borderTopColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        {/* Slide-reveal wrapper — overflow hidden scoped to main row only */}
                        <View style={{ overflow: "hidden" }}>
                          {/* Action buttons revealed on slide */}
                          <View
                            style={{
                              position: "absolute",
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: actionWidth,
                              flexDirection: "row",
                            }}
                          >
                            <View
                              style={{
                                flex: 1,
                                flexDirection: "row",
                                marginLeft: 8,
                                overflow: "hidden",
                                backgroundColor: theme.colors.surfaceVariant,
                              }}
                            >
                              <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => {
                                  toggleReveal(expandKey);
                                  router.push({
                                    pathname:
                                      "/(screens)/(net-worth)/(investments)/[id]",
                                    params: {
                                      id: "new",
                                      prefillName: mostRecent.name,
                                      prefillSymbol: mostRecent.symbol ?? "",
                                      prefillExchange: mostRecent.exchange ?? "",
                                      prefillPlatform: mostRecent.platform ?? "",
                                      prefillCurrency: mostRecent.currency ?? "",
                                      prefillType: mostRecent.type,
                                    },
                                  });
                                }}
                                style={{
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  backgroundColor: "rgba(115,219,145,0.18)",
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="plus-circle-outline"
                                  size={18}
                                  color="#73db91"
                                />
                                <Text
                                  style={{
                                    color: "#73db91",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  Add
                                </Text>
                              </TouchableOpacity>
                              {!isGrouped && (
                                <TouchableOpacity
                                  activeOpacity={0.75}
                                  onPress={() => {
                                    toggleReveal(expandKey);
                                    router.push({
                                      pathname:
                                        "/(screens)/(net-worth)/(investments)/[id]",
                                      params: { id: rep.id },
                                    });
                                  }}
                                  style={{
                                    flex: 1,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                    backgroundColor: "rgba(168,199,250,0.18)",
                                  }}
                                >
                                  <MaterialCommunityIcons
                                    name="pencil-outline"
                                    size={18}
                                    color="#a8c7fa"
                                  />
                                  <Text
                                    style={{
                                      color: "#a8c7fa",
                                      fontSize: 11,
                                      fontWeight: "600",
                                    }}
                                  >
                                    Edit
                                  </Text>
                                </TouchableOpacity>
                              )}
                              <TouchableOpacity
                                activeOpacity={0.75}
                                onPress={() => {
                                  toggleReveal(expandKey);
                                  router.push({
                                    pathname:
                                      "/(screens)/(net-worth)/(investments)/sell",
                                    params: {
                                      symbol: rep.symbol ?? "",
                                      name: rep.name,
                                      investmentType: rep.type,
                                    },
                                  });
                                }}
                                style={{
                                  flex: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 4,
                                  backgroundColor: "rgba(255,180,171,0.18)",
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="cash-remove"
                                  size={18}
                                  color="#ffb4ab"
                                />
                                <Text
                                  style={{
                                    color: "#ffb4ab",
                                    fontSize: 11,
                                    fontWeight: "600",
                                  }}
                                >
                                  Sold
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* Sliding main row */}
                          <Animated.View
                            style={{
                              transform: [
                                {
                                  translateX: getRevealAnim(
                                    expandKey,
                                  ).interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -actionWidth],
                                  }),
                                },
                              ],
                              backgroundColor: theme.colors.elevation.level2,
                            }}
                          >
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() => toggleReveal(expandKey)}
                              className="flex-row justify-between items-center py-3"
                            >
                              {/* Avatar + name */}
                              <View className="flex-row items-center gap-3 flex-1 mr-3">
                                <View
                                  className="w-10 h-10 rounded-full items-center justify-center"
                                  style={{
                                    backgroundColor:
                                      theme.colors.elevation.level3,
                                  }}
                                >
                                  <Text
                                    className="text-xs font-semibold"
                                    style={{ color: theme.colors.onSurface }}
                                  >
                                    {avatarText}
                                  </Text>
                                </View>
                                <View className="flex-1">
                                  <Text
                                    className="text-sm font-medium"
                                    style={{ color: theme.colors.onSurface }}
                                  >
                                    {displayName}
                                  </Text>
                                  <Text
                                    className="text-xs mt-0.5"
                                    style={{
                                      color: theme.colors.onSurfaceVariant,
                                    }}
                                  >
                                    {isGrouped
                                      ? `${symInvestments.length} purchases · Qty: ${totalQty}`
                                      : [
                                          rep.platform,
                                          rep.quantity != null
                                            ? `Qty: ${rep.quantity}`
                                            : null,
                                        ]
                                          .filter(Boolean)
                                          .join(" · ")}
                                  </Text>
                                </View>
                              </View>

                              {/* Value + chevron */}
                              <View className="flex-row items-center gap-2">
                                <View className="items-end">
                                  <Text
                                    className="text-sm font-medium"
                                    style={{ color: theme.colors.onSurface }}
                                  >
                                    {formatCurrency(symCurrentValue)}
                                  </Text>
                                  {symHasCurrentValue ? (
                                    <Text
                                      className="text-xs mt-0.5"
                                      style={{ color: symGainColor }}
                                    >
                                      {`${symGainPrefix}${formatCurrency(Math.abs(symGain))}`}
                                    </Text>
                                  ) : (
                                    <View
                                      className="mt-0.5 px-1.5 py-0.5 rounded-full"
                                      style={{
                                        backgroundColor:
                                          "rgba(168,199,250,0.15)",
                                      }}
                                    >
                                      <Text
                                        className="text-xs font-medium"
                                        style={{ color: "#a8c7fa" }}
                                      >
                                        Invested
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                {isGrouped && (
                                  <TouchableOpacity
                                    hitSlop={{
                                      top: 8,
                                      bottom: 8,
                                      left: 8,
                                      right: 8,
                                    }}
                                    onPress={() => toggleExpanded(expandKey)}
                                  >
                                    <MaterialCommunityIcons
                                      name={
                                        isOpen ? "chevron-up" : "chevron-down"
                                      }
                                      size={20}
                                      color={theme.colors.onSurfaceVariant}
                                    />
                                  </TouchableOpacity>
                                )}
                              </View>
                            </TouchableOpacity>
                          </Animated.View>
                        </View>

                        {/* Expanded individual purchases */}
                        {isGrouped && isOpen && (
                          <View
                            className="ml-4 mb-2 rounded-2xl overflow-hidden"
                            style={{
                              backgroundColor: theme.colors.elevation.level3,
                            }}
                          >
                            {symInvestments.map((inv, invIdx) => {
                              const invGain =
                                toInr(
                                  effectiveCurrentValue(inv),
                                  inv.currency,
                                ) - toInr(inv.investedAmount, inv.currency);
                              const invGainColor =
                                invGain >= 0 ? "#6dd58c" : theme.colors.error;
                              return (
                                <TouchableOpacity
                                  key={inv.id}
                                  activeOpacity={0.7}
                                  onPress={() =>
                                    router.push({
                                      pathname:
                                        "/(screens)/(net-worth)/(investments)/[id]",
                                      params: { id: inv.id },
                                    })
                                  }
                                  className="flex-row justify-between items-center px-4 py-3"
                                  style={{
                                    borderTopWidth: invIdx > 0 ? 1 : 0,
                                    borderTopColor: "rgba(255,255,255,0.05)",
                                  }}
                                >
                                  <View className="flex-1 mr-3">
                                    <Text
                                      className="text-sm"
                                      style={{ color: theme.colors.onSurface }}
                                    >
                                      {inv.platform ?? inv.name}
                                    </Text>
                                    <Text
                                      className="text-xs mt-0.5"
                                      style={{
                                        color: theme.colors.onSurfaceVariant,
                                      }}
                                    >
                                      {[
                                        inv.quantity != null
                                          ? `Qty: ${inv.quantity}`
                                          : null,
                                        inv.investedAmount
                                          ? `Invested: ${formatCurrency(toInr(inv.investedAmount, inv.currency))}`
                                          : null,
                                      ]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </Text>
                                  </View>
                                  <View className="items-end">
                                    <Text
                                      className="text-sm font-medium"
                                      style={{ color: theme.colors.onSurface }}
                                    >
                                      {formatCurrency(
                                        toInr(
                                          effectiveCurrentValue(inv),
                                          inv.currency,
                                        ),
                                      )}
                                    </Text>
                                    {inv.currentValue > 0 ? (
                                      <Text
                                        className="text-xs mt-0.5"
                                        style={{ color: invGainColor }}
                                      >
                                        {`${invGain >= 0 ? "+" : ""}${formatCurrency(Math.abs(invGain))}`}
                                      </Text>
                                    ) : (
                                      <View
                                        className="mt-0.5 px-1.5 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor:
                                            "rgba(168,199,250,0.15)",
                                        }}
                                      >
                                        <Text
                                          className="text-xs font-medium"
                                          style={{ color: "#a8c7fa" }}
                                        >
                                          Invested
                                        </Text>
                                      </View>
                                    )}
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        )}
                      </View>
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
