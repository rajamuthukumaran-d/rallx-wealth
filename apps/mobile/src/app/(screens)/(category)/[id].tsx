import {
  createCategory,
  deleteCategory,
  updateCategory,
  useCategory,
} from "@/data/controllers/useCategories";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import {
  Appbar,
  Button,
  IconButton,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

export default function CategoryEditScreen() {
  const params = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();

  const id = params.id as string;
  const isEditing = id !== "new";

  const { category } = useCategory(isEditing ? id : "");

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("shape");
  const [type, setType] = useState("expense");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setType(category.type);
    }
  }, [category]);

  const handleSave = async () => {
    if (!name.trim()) return;

    try {
      if (isEditing && category) {
        await updateCategory(category, { name, icon, type });
      } else {
        await createCategory({ name, icon, type });
      }
      router.back();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (isEditing && category) {
      try {
        await deleteCategory(category);
        router.back();
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Appbar.Header elevated>
              <Appbar.BackAction onPress={() => router.back()} />
              <Appbar.Content
                title={isEditing ? "Edit Category" : "Add Category"}
              />
              {isEditing && (
                <Appbar.Action icon="delete" onPress={handleDelete} />
              )}
            </Appbar.Header>
          ),
        }}
      />
      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ScrollView className="px-4 py-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6">
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={{ backgroundColor: theme.colors.elevation.level1 }}
            />
          </View>

          <View className="mb-6">
            <Text
              style={{ color: theme.colors.onSurfaceVariant }}
              className="mb-2 ml-1 text-sm font-medium"
            >
              Select Icon
            </Text>
            <View
              className="rounded-3xl p-4 flex-row flex-wrap gap-4 justify-center"
              style={{ backgroundColor: theme.colors.elevation.level1 }}
            >
              {[
                "cash-multiple",
                "bank",
                "wallet",
                "credit-card",
                "cart",
                "food",
                "gas-station",
                "airplane",
                "train",
                "home",
                "medical-bag",
                "school",
                "movie-open",
                "tshirt-crew",
                "account-group",
                "gift",
                "chart-line",
                "piggy-bank",
                "bitcoin",
                "currency-usd",
              ].map((iconName) => (
                <IconButton
                  key={iconName}
                  icon={iconName}
                  size={28}
                  mode={icon === iconName ? "contained" : "contained-tonal"}
                  containerColor={
                    icon === iconName ? theme.colors.primary : "transparent"
                  }
                  iconColor={
                    icon === iconName
                      ? theme.colors.onPrimary
                      : theme.colors.onSurfaceVariant
                  }
                  onPress={() => setIcon(iconName)}
                />
              ))}
            </View>
            <TextInput
              label="Custom Material Icon Name"
              value={icon}
              onChangeText={setIcon}
              mode="outlined"
              autoCapitalize="none"
              style={{
                backgroundColor: theme.colors.elevation.level1,
                marginTop: 16,
              }}
              left={<TextInput.Icon icon={icon || "shape"} />}
            />
            <Text
              style={{ color: theme.colors.onSurfaceVariant }}
              className="mt-2 ml-1 text-xs"
            >
              Browse all free icons at:{" "}
              <Text
                style={{ color: theme.colors.primary }}
                onPress={() =>
                  Linking.openURL("https://materialdesignicons.com/")
                }
              >
                materialdesignicons.com
              </Text>
            </Text>
          </View>

          <View className="mb-8">
            <SegmentedButtons
              value={type}
              onValueChange={setType}
              theme={{
                colors: {
                  secondaryContainer:
                    type === "income" ? "#1b5e20" : theme.colors.errorContainer,
                  onSecondaryContainer:
                    type === "income"
                      ? "#ffffff"
                      : theme.colors.onErrorContainer,
                },
              }}
              buttons={[
                {
                  value: "income",
                  label: "Income",
                  checkedColor: "#ffffff",
                },
                {
                  value: "expense",
                  label: "Expense",
                  checkedColor: theme.colors.onErrorContainer,
                },
              ]}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            className="rounded-full py-1"
          >
            Save Category
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
