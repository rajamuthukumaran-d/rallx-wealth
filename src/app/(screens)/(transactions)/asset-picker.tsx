import { ScreenHeader } from "@/components/ScreenHeader";
import { useAssets } from "@/data/controllers/useAssets";
import { pickerStore } from "@/utils/pickerStore";
import { Stack, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";

const ASSET_ICONS: Record<string, string> = {
  bank: "bank",
  wallet: "wallet",
  cash: "cash",
  fd: "piggy-bank",
  stock: "chart-line",
  real_estate: "home",
};

export default function AssetPickerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { assets } = useAssets(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Select Account" />,
        }}
      />
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            {assets.map((asset, index) => (
              <View key={asset.id}>
                <List.Item
                  title={asset.name}
                  description={asset.type}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={ASSET_ICONS[asset.type] ?? "bank"}
                    />
                  )}
                  style={{ minHeight: 56 }}
                  onPress={() => {
                    pickerStore.resolve(asset.id, asset.name);
                    router.back();
                  }}
                />
                {index < assets.length - 1 && <Divider />}
              </View>
            ))}
            {assets.length === 0 && (
              <List.Item
                title="No accounts found. Add an asset first."
                style={{ minHeight: 56 }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
