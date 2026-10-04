import { formatDueDate, groupByType, formatCurrency, formatFullCurrency } from "@rallx-wealth/utils-frontend";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useDebts } from "@/data/controllers/useDebts";
import Debt from "@/data/models/Debt";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Appbar, FAB, Text, useTheme } from "react-native-paper";

type TypeConfig = { icon: string; label: string; bgColor: string; iconColor: string };

const TYPE_CONFIG_MAP: Record<string, TypeConfig> = {
  loan: {
    icon: "bank",
    label: "Loans",
    bgColor: "rgba(168,199,250,0.2)",
    iconColor: "#a8c7fa",
  },
  credit_card: {
    icon: "credit-card-outline",
    label: "Credit Cards",
    bgColor: "rgba(255,180,171,0.2)",
    iconColor: "#ffb4ab",
  },
  emi: {
    icon: "clock-outline",
    label: "EMIs",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  pay_later: {
    icon: "shopping-outline",
    label: "Pay Later",
    bgColor: "rgba(187,199,219,0.2)",
    iconColor: "#bbc7db",
  },
};

const FALLBACK_PALETTE: Omit<TypeConfig, "label">[] = [
  { icon: "bank", bgColor: "rgba(168,199,250,0.2)", iconColor: "#a8c7fa" },
  { icon: "credit-card-outline", bgColor: "rgba(255,180,171,0.2)", iconColor: "#ffb4ab" },
  { icon: "clock-outline", bgColor: "rgba(115,219,145,0.2)", iconColor: "#73db91" },
  { icon: "shopping-outline", bgColor: "rgba(187,199,219,0.2)", iconColor: "#bbc7db" },
  { icon: "cash-multiple", bgColor: "rgba(165,142,251,0.2)", iconColor: "#a58efb" },
];

function getTypeConfig(type: string, index: number): TypeConfig {
  const key = type.toLowerCase();
  if (TYPE_CONFIG_MAP[key]) return TYPE_CONFIG_MAP[key];
  const fallback = FALLBACK_PALETTE[index % FALLBACK_PALETTE.length];
  return { ...fallback, label: type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) };
}

type MetaItem = { label: string; value: string; alignRight?: boolean };

function getMetaItems(debt: Debt): [MetaItem, MetaItem, MetaItem, MetaItem] {
  const type = debt.type.toLowerCase();
  const dueDate = formatDueDate(debt.dueDate);
  const rate = debt.interestRate != null ? `${debt.interestRate}% APR` : "—";

  if (type === "credit_card" || type === "pay_later") {
    const available = Math.max(0, debt.totalAmount - debt.remainingAmount);
    return [
      { label: "Credit Limit", value: formatFullCurrency(debt.totalAmount) },
      { label: "Available", value: formatFullCurrency(available), alignRight: true },
      { label: "Due Date", value: dueDate },
      { label: "Interest Rate", value: rate, alignRight: true },
    ];
  }
  if (type === "emi") {
    return [
      { label: "Principal", value: formatFullCurrency(debt.totalAmount) },
      { label: "Balance", value: formatFullCurrency(debt.remainingAmount), alignRight: true },
      { label: "Due Date", value: dueDate },
      { label: "Interest Rate", value: rate, alignRight: true },
    ];
  }
  return [
    { label: "Principal", value: formatFullCurrency(debt.totalAmount) },
    {
      label: "Payment",
      value: debt.emiAmount ? formatFullCurrency(debt.emiAmount) : "—",
      alignRight: true,
    },
    { label: "Due Date", value: dueDate },
    { label: "Interest Rate", value: rate, alignRight: true },
  ];
}

export default function DebtsBreakdownScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [showClosed, setShowClosed] = useState(false);
  const { debts, totalRemaining, isLoading } = useDebts(showClosed ? "all" : "active");
  const groups = groupByType(debts);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader
              title="Debts"
              isTransparent
              rightActions={
                <Appbar.Action
                  icon={showClosed ? "filter" : "filter-outline"}
                  onPress={() => setShowClosed((v) => !v)}
                  iconColor={showClosed ? theme.colors.primary : undefined}
                />
              }
            />
          ),
        }}
      />
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Summary header */}
          <View className="items-center py-6 px-4">
            <Text
              className="text-sm font-medium mb-1 uppercase tracking-wider"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Debts
            </Text>
            <Text className="text-4xl font-normal mb-3" style={{ color: theme.colors.error }}>
              {isLoading ? "—" : `-${formatFullCurrency(totalRemaining)}`}
            </Text>
            <View
              className="flex-row items-center gap-1 px-3 py-1 rounded-full"
              style={{ backgroundColor: theme.colors.errorContainer }}
            >
              <MaterialCommunityIcons
                name="credit-card-off-outline"
                size={14}
                color={theme.colors.onErrorContainer}
              />
              <Text className="text-sm font-medium" style={{ color: theme.colors.onErrorContainer }}>
                {debts.length} {debts.length === 1 ? "debt" : "debts"}
              </Text>
            </View>
          </View>

          {/* Debt type cards */}
          <View className="px-4 gap-3">
            {groups.map(([type, typeDebts], idx) => {
              const config = getTypeConfig(type, idx);
              const typeTotal = typeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

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
                    <Text className="text-sm font-medium" style={{ color: theme.colors.error }}>
                      -{formatCurrency(typeTotal)}
                    </Text>
                  </View>

                  {/* Individual debt rows */}
                  {typeDebts.map((debt, dIdx) => {
                    const meta = getMetaItems(debt);
                    return (
                      <TouchableOpacity
                        key={debt.id}
                        activeOpacity={0.7}
                        onPress={() =>
                          router.push({
                            pathname: "/(screens)/(net-worth)/(debts)/[id]",
                            params: { id: debt.id },
                          })
                        }
                        className="py-4"
                        style={{
                          borderTopWidth: dIdx > 0 ? 1 : 0,
                          borderTopColor: "rgba(255,255,255,0.05)",
                        }}
                      >
                        <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-row items-center gap-2 flex-1 mr-2">
                            <Text
                              className="text-base"
                              style={{ color: theme.colors.onSurface }}
                            >
                              {debt.name}
                            </Text>
                            {debt.status === "closed" && (
                              <View
                                className="px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: theme.colors.surfaceVariant }}
                              >
                                <Text
                                  className="text-[10px] font-medium uppercase tracking-wider"
                                  style={{ color: theme.colors.onSurfaceVariant }}
                                >
                                  Closed
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            className="text-base font-medium"
                            style={{ color: theme.colors.error }}
                          >
                            -{formatCurrency(debt.remainingAmount)}
                          </Text>
                        </View>

                        {/* 2×2 metadata grid */}
                        <View className="flex-row flex-wrap gap-y-2 mt-1">
                          {meta.map((item) => (
                            <View
                              key={item.label}
                              className="w-1/2"
                              style={{ alignItems: item.alignRight ? "flex-end" : "flex-start" }}
                            >
                              <Text
                                className="text-[11px] font-medium uppercase"
                                style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7 }}
                              >
                                {item.label}
                              </Text>
                              <Text
                                className="text-sm font-medium mt-0.5"
                                style={{ color: theme.colors.onSurfaceVariant }}
                              >
                                {item.value}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {/* Empty state */}
            {!isLoading && debts.length === 0 && (
              <View className="items-center py-16">
                <MaterialCommunityIcons
                  name="credit-card-check-outline"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                  style={{ opacity: 0.4 }}
                />
                <Text
                  className="mt-3 text-sm text-center"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  No debts recorded. Add your first debt below.
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
              pathname: "/(screens)/(net-worth)/(debts)/[id]",
              params: { id: "new" },
            })
          }
        />
      </View>
    </>
  );
}
