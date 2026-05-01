import { ScreenHeader } from "@/components/ScreenHeader";
import { useAssets } from "@/data/controllers/useAssets";
import Asset from "@/data/models/Asset";
import { formatCurrency, formatFullCurrency } from "@/utils/currency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";

type TypeConfig = { icon: string; bgColor: string; iconColor: string };

const TYPE_ICON_MAP: Record<string, TypeConfig> = {
  bank: {
    icon: "bank",
    bgColor: "rgba(168,199,250,0.2)",
    iconColor: "#a8c7fa",
  },
  fd: {
    icon: "piggy-bank",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  "fixed deposit": {
    icon: "piggy-bank",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  wallet: {
    icon: "wallet",
    bgColor: "rgba(187,199,219,0.2)",
    iconColor: "#bbc7db",
  },
  cash: {
    icon: "cash",
    bgColor: "rgba(255,180,171,0.2)",
    iconColor: "#ffb4ab",
  },
  savings: {
    icon: "piggy-bank",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
};

const FALLBACK_PALETTE: TypeConfig[] = [
  { icon: "bank", bgColor: "rgba(168,199,250,0.2)", iconColor: "#a8c7fa" },
  {
    icon: "piggy-bank",
    bgColor: "rgba(115,219,145,0.2)",
    iconColor: "#73db91",
  },
  { icon: "wallet", bgColor: "rgba(187,199,219,0.2)", iconColor: "#bbc7db" },
  { icon: "cash", bgColor: "rgba(255,180,171,0.2)", iconColor: "#ffb4ab" },
  {
    icon: "bank-outline",
    bgColor: "rgba(165,142,251,0.2)",
    iconColor: "#a58efb",
  },
];

function getTypeConfig(type: string, index: number): TypeConfig {
  return (
    TYPE_ICON_MAP[type.toLowerCase()] ??
    FALLBACK_PALETTE[index % FALLBACK_PALETTE.length]
  );
}

function groupByType(assets: Asset[]): [string, Asset[]][] {
  const map: Record<string, Asset[]> = {};
  for (const asset of assets) {
    if (!map[asset.type]) map[asset.type] = [];
    map[asset.type].push(asset);
  }
  return Object.entries(map);
}

export default function AssetsBreakdownScreen() {
  const theme = useTheme();
  const { assets, totalBalance, isLoading } = useAssets(false);
  const groups = groupByType(assets);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Assets" isTransparent />,
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
          {/* Total header */}
          <View className="items-center py-6 px-4">
            <Text
              className="text-sm font-medium mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Assets
            </Text>
            <Text
              className="text-4xl font-normal mb-3"
              style={{ color: theme.colors.onSurface }}
            >
              {isLoading ? "—" : formatFullCurrency(totalBalance)}
            </Text>
            <View
              className="flex-row items-center gap-1 px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(109,213,140,0.15)" }}
            >
              <MaterialCommunityIcons
                name="bank-outline"
                size={14}
                color="#6dd58c"
              />
              <Text
                className="text-sm font-medium"
                style={{ color: "#6dd58c" }}
              >
                {assets.length} {assets.length === 1 ? "asset" : "assets"}
              </Text>
            </View>
          </View>

          {/* Asset type cards */}
          <View className="px-4 gap-3">
            {groups.map(([type, typeAssets], idx) => {
              const config = getTypeConfig(type, idx);
              const typeTotal = typeAssets.reduce(
                (sum, a) => sum + a.balance,
                0,
              );

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
                        className="text-base font-medium capitalize"
                        style={{ color: theme.colors.onSurface }}
                      >
                        {type}
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-medium"
                      style={{ color: theme.colors.onSurfaceVariant }}
                    >
                      {formatCurrency(typeTotal)}
                    </Text>
                  </View>

                  {/* Individual asset rows */}
                  {typeAssets.map((asset, aIdx) => (
                    <View
                      key={asset.id}
                      className="flex-row justify-between items-center py-2.5"
                      style={{
                        borderTopWidth: aIdx > 0 ? 1 : 0,
                        borderTopColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <View className="flex-1 mr-4">
                        <Text
                          className="text-base"
                          style={{ color: theme.colors.onSurface }}
                        >
                          {asset.name}
                        </Text>
                        {asset.interestRate ? (
                          <Text
                            className="text-xs mt-0.5"
                            style={{ color: theme.colors.onSurfaceVariant }}
                          >
                            {asset.interestRate}% p.a.
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        className="text-base"
                        style={{ color: theme.colors.onSurfaceVariant }}
                      >
                        {formatCurrency(asset.balance)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Empty state */}
            {!isLoading && assets.length === 0 && (
              <View className="items-center py-16">
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={48}
                  color={theme.colors.onSurfaceVariant}
                  style={{ opacity: 0.4 }}
                />
                <Text
                  className="mt-3 text-sm text-center"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  No assets yet. Add your first asset below.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <FAB
          icon="plus"
          label="Add New Asset"
          className="absolute right-4 bottom-8"
          onPress={() => {
            // TODO: navigate to add asset screen
          }}
        />
      </View>
    </>
  );
}
