import { Stack, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import {
  Appbar,
  Divider,
  IconButton,
  List,
  Text,
  useTheme,
} from "react-native-paper";
import { exportDatabase, importDatabase } from "../../../data/backupService";

export default function BackupRestoreScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <Appbar.Header elevated>
              <Appbar.BackAction onPress={() => router.back()} />
              <Appbar.Content title="Backup & Restore" />
            </Appbar.Header>
          ),
        }}
      />
      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ScrollView
          className="flex-1 px-4 py-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-6">
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Securely export your financial data or restore from a previously
              saved backup file.
            </Text>
          </View>

          <View
            className="rounded-3xl overflow-hidden mb-6"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            <List.Item
              title="Export Data"
              description="Save a backup file to your device"
              style={{ minHeight: 76, justifyContent: "center" }}
              left={(props) => <List.Icon {...props} icon="database-export" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="download"
                  onPress={exportDatabase}
                />
              )}
              onPress={exportDatabase}
            />
            <Divider />
            <List.Item
              title="Import Data"
              description="Restore data from a .rallxdb file"
              style={{ minHeight: 76, justifyContent: "center" }}
              left={(props) => <List.Icon {...props} icon="database-import" />}
              right={(props) => (
                <IconButton {...props} icon="upload" onPress={importDatabase} />
              )}
              onPress={importDatabase}
            />
          </View>

          <View
            className="mb-6 p-4 rounded-2xl"
            style={{ backgroundColor: theme.colors.errorContainer }}
          >
            <Text
              variant="titleMedium"
              style={{ color: theme.colors.onErrorContainer, marginBottom: 4 }}
            >
              Warning
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onErrorContainer }}
            >
              Importing a backup will completely overwrite your current
              database. Ensure you select the correct backup file to prevent
              data loss.
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}
