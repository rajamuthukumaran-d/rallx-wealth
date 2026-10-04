import { useRouter } from "expo-router";
import { View } from "react-native";
import { FAB, Text, useTheme } from "react-native-paper";

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="flex-1 items-center justify-center">
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          No transactions yet
        </Text>
      </View>

      <FAB
        icon="plus"
        className="absolute right-4 bottom-8"
        onPress={() => router.push("/(screens)/(transactions)/add")}
      />
    </View>
  );
}
