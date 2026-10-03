import { ScreenHeader } from "@/components/ScreenHeader";
import { useCategories } from "@/data/controllers/useCategories";
import { pickerStore } from "@/utils/pickerStore";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";

export default function CategoryPickerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const { categories } = useCategories();

  const filtered = categories.filter((c) => c.type === (type || "expense"));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Select Category" />,
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
            {filtered.map((category, index) => (
              <View key={category.id}>
                <List.Item
                  title={category.name}
                  left={(props) => <List.Icon {...props} icon={category.icon} />}
                  style={{ minHeight: 56 }}
                  onPress={() => {
                    pickerStore.resolve(category.id, category.name);
                    router.back();
                  }}
                />
                {index < filtered.length - 1 && <Divider />}
              </View>
            ))}
            {filtered.length === 0 && (
              <List.Item
                title="No categories found"
                style={{ minHeight: 56 }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}
