import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { database } from "./index";

// All WatermelonDB table names in dependency order (parents before children).
const TABLE_NAMES = [
  "categories",
  "assets",
  "investments",
  "debts",
  "transactions",
  "transaction_amounts",
  "budgets",
] as const;

type TableName = (typeof TABLE_NAMES)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wraps the adapter's `unsafeExecute` (raw SQL batch) in a Promise.
 * Used for import so we can INSERT with custom IDs — WatermelonDB's
 * prepareCreate always generates a new ID, making it unsuitable for restore.
 */
const runSQL = (sqls: [string, any[]][]) =>
  new Promise<void>((resolve, reject) => {
    (database.adapter as any).unsafeExecute(
      { sqls },
      (error: Error | undefined) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const exportDatabase = async () => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Sharing is not available on this device.");
      return;
    }

    // Query every record from every table via WatermelonDB's JS API.
    const tables: Record<string, object[]> = {};
    for (const tableName of TABLE_NAMES) {
      const records = await database.get(tableName).query().fetch();
      tables[tableName] = records.map((r) => ({ ...(r as any)._raw }));
    }

    const payload = JSON.stringify({ version: 1, tables });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = new File(
      Paths.cache,
      `Rallx_Wealth_Backup_${timestamp}.rallxdb`,
    );
    if (backupFile.exists) backupFile.delete();
    backupFile.create();
    backupFile.write(payload);

    await Sharing.shareAsync(backupFile.uri, {
      mimeType: "application/json",
      dialogTitle: "Export Rallx Wealth Backup",
    });
  } catch (error) {
    console.error("Export Error:", error);
    Alert.alert("Error", "Failed to export the database.");
  }
};

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

export const importDatabase = async () => {
  try {
    const picked = await File.pickFileAsync();
    const pickedFile = Array.isArray(picked) ? picked[0] : picked;
    if (!pickedFile) return;

    Alert.alert(
      "Restore Database",
      "Are you sure? All current data will be replaced. The app will need to be restarted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: async () => {
            try {
              const text = await pickedFile.text();

              // Guard: old binary format starts with "RALLXDB1".
              if (text.startsWith("RALLXDB1")) {
                throw new Error(
                  "This backup was created with an older version of the app. Please export a fresh backup first.",
                );
              }

              let backup: any;
              try {
                backup = JSON.parse(text);
              } catch {
                throw new Error(
                  "The selected file is not a valid Rallx Wealth backup.",
                );
              }

              if (backup?.version !== 1 || !backup.tables) {
                throw new Error("Invalid or incompatible backup file.");
              }

              // Build a single SQL batch:
              // 1. DELETE all rows from every table (reverse dependency order).
              // 2. INSERT every backup row with original IDs preserved.
              //
              // We use raw SQL via unsafeExecute because WatermelonDB's
              // prepareCreate always generates a new UUID — there's no
              // supported way to set a custom ID through the JS model API.
              const sqls: [string, any[]][] = [];

              // Delete in reverse order to respect foreign key dependencies.
              for (const tableName of [...TABLE_NAMES].reverse()) {
                sqls.push([`DELETE FROM ${tableName}`, []]);
              }

              // Insert in forward order (parents before children).
              for (const tableName of TABLE_NAMES) {
                const rows: any[] = backup.tables[tableName] ?? [];
                for (const raw of rows) {
                  const keys = Object.keys(raw);
                  const placeholders = keys.map(() => "?").join(", ");
                  sqls.push([
                    `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`,
                    keys.map((k) => raw[k]),
                  ]);
                }
              }

              await runSQL(sqls);

              Alert.alert(
                "Success",
                "Database restored successfully. Please restart the app for the changes to take effect.",
                [{ text: "OK" }],
              );
            } catch (restoreError) {
              console.error("Restore Error:", restoreError);
              Alert.alert(
                "Error",
                `Failed to restore: ${(restoreError as Error).message}`,
              );
            }
          },
        },
      ],
    );
  } catch (error) {
    console.error("Import Error:", error);
    Alert.alert("Error", "Failed to open the file picker.");
  }
};
