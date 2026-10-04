import { database } from "./index";
import Category from "./models/Category";

const DEFAULT_CATEGORIES = [
  { name: "Income", icon: "cash-plus", type: "income" },
  { name: "Cashback", icon: "cash-refund", type: "income" },
  { name: "Entertainment", icon: "movie-open", type: "expense" },
  { name: "Food", icon: "food", type: "expense" },
  { name: "Groceries", icon: "cart", type: "expense" },
  { name: "Apparel", icon: "tshirt-crew", type: "expense" },
  { name: "Travel", icon: "airplane", type: "expense" },
  { name: "Social", icon: "account-group", type: "expense" },
];

export async function seedDefaultCategories() {
  const categoriesCollection = database.get<Category>("categories");
  const existingCount = await categoriesCollection.query().fetchCount();

  if (existingCount === 0) {
    await database.write(async () => {
      const recordsToCreate = DEFAULT_CATEGORIES.map((cat) =>
        categoriesCollection.prepareCreate((record) => {
          record.name = cat.name;
          record.icon = cat.icon;
          record.type = cat.type;
        }),
      );
      await database.batch(...recordsToCreate);
    });
    console.log("Seeded default categories.");
  }
}
