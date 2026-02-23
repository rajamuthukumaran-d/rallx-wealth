import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import Asset from "./models/Asset";
import Budget from "./models/Budget";
import Category from "./models/Category";
import Debt from "./models/Debt";
import Investment from "./models/Investment";
import Transaction from "./models/Transaction";
import TransactionAmount from "./models/TransactionAmount";
import { schema } from "./schema";

const adapter = new SQLiteAdapter({
  schema,
  // jsi: true /* recommended for React Native */,
  onSetUpError: (error) => {
    // Database failed to load
    console.error("WatermelonDB setup error", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Category,
    Asset,
    Investment,
    Debt,
    Transaction,
    TransactionAmount,
    Budget,
  ],
});
