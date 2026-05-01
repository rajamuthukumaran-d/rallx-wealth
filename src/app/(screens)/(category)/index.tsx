import { withObservables } from "@nozbe/watermelondb/react";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  FAB,
  IconButton,
  List,
  SegmentedButtons,
  useTheme,
} from "react-native-paper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { database } from "../../../data";
import Category from "../../../data/models/Category";

const CategoryListItem = withObservables(
  ["category"],
  ({ category }: { category: Category }) => ({
    category,
  }),
)(
  ({
    category,
    theme,
    router,
    isLast,
  }: {
    category: Category;
    theme: any;
    router: any;
    isLast: boolean;
  }) => (
    <List.Item
      title={category.name}
      style={{
        minHeight: 76,
        justifyContent: "center",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.colors.surfaceVariant,
      }}
      left={(props) => <List.Icon {...props} icon={category.icon} />}
      right={(props) => (
        <IconButton
          {...props}
          icon="delete"
          onPress={async () => {
            try {
              await database.write(async () => {
                await category.markAsDeleted();
              });
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}
      onPress={() => {
        router.push(`/(screens)/(category)/${category.id}`);
      }}
    />
  ),
);

function ManageCategoriesScreen({ categories }: { categories: Category[] }) {
  const theme = useTheme();
  const router = useRouter();
  const [filterType, setFilterType] = useState("expense");

  const filteredCategories = categories.filter(
    (cat) => cat.type === filterType,
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Manage Categories" />,
        }}
      />
      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <View className="px-4 py-4">
          <SegmentedButtons
            value={filterType}
            onValueChange={setFilterType}
            theme={{
              colors: {
                secondaryContainer:
                  filterType === "income"
                    ? "#1b5e20"
                    : theme.colors.errorContainer,
                onSecondaryContainer:
                  filterType === "income"
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

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View
            className="rounded-3xl overflow-hidden mb-24"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            {filteredCategories.map((category, index) => (
              <CategoryListItem
                key={category.id}
                category={category}
                theme={theme}
                router={router}
                isLast={index === filteredCategories.length - 1}
              />
            ))}
            {filteredCategories.length === 0 && (
              <List.Item
                title="No categories found"
                style={{ minHeight: 76, justifyContent: "center" }}
              />
            )}
          </View>
        </ScrollView>

        <FAB
          icon="plus"
          className="absolute right-4 bottom-8"
          onPress={() => {
            router.push("/(screens)/(category)/new");
          }}
        />
      </View>
    </>
  );
}

export default withObservables([], () => ({
  categories: database.get<Category>("categories").query(),
}))(ManageCategoriesScreen);
