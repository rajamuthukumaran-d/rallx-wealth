import { Stack } from "expo-router";
import { useState } from "react";
import { BackHandler, Platform, ScrollView, View } from "react-native";
import {
    Button,
    Dialog,
    Divider,
    IconButton,
    List,
    Portal,
    ProgressBar,
    Text,
    useTheme,
} from "react-native-paper";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
    exportDatabase,
    pickBackupFile,
    restoreDatabase,
} from "../../../data/backupService";

export default function BackupRestoreScreen() {
  const theme = useTheme();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<
    "confirm" | "progress" | "success" | "error"
  >("confirm");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [pickedFile, setPickedFile] = useState<any>(null);
  const [pendingRestart, setPendingRestart] = useState(false);

  const handleExport = async () => {
    try {
      setDialogType("progress");
      setDialogTitle("Exporting Database");
      setDialogMessage("Please wait while your data is being exported...");
      setProgress(0);
      setDialogVisible(true);

      await exportDatabase((p) => setProgress(p));

      setDialogType("success");
      setDialogTitle("Success");
      setDialogMessage("Database exported successfully.");
    } catch (error: any) {
      setDialogType("error");
      setDialogTitle("Error");
      setDialogMessage(error.message || "Failed to export the database.");
    }
  };

  const handleImportClick = async () => {
    try {
      const file = await pickBackupFile();
      if (!file) return;

      setPickedFile(file);
      setDialogType("confirm");
      setDialogTitle("Restore Database");
      setDialogMessage(
        "Are you sure? All current data will be replaced. The app will need to be restarted.",
      );
      setDialogVisible(true);
    } catch (error: any) {
      setDialogType("error");
      setDialogTitle("Error");
      setDialogMessage(error.message || "Failed to open the file picker.");
      setDialogVisible(true);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!pickedFile) return;

    try {
      setDialogType("progress");
      setDialogTitle("Restoring Database");
      setDialogMessage("Please wait while your data is being restored...");
      setProgress(0);

      await restoreDatabase(pickedFile, (p) => setProgress(p));

      // Let the progress bar visually hit 100% before unmounting it
      await new Promise((resolve) => setTimeout(resolve, 500));

      setDialogType("success");
      setDialogTitle("Success");
      setDialogMessage(
        Platform.OS === "android"
          ? "Database restored successfully. The app will now close — please reopen it."
          : "Database restored successfully. Please restart the app for the changes to take effect.",
      );
      setPendingRestart(true);
      setPickedFile(null);
    } catch (error: any) {
      setDialogType("error");
      setDialogTitle("Error");
      setDialogMessage(`Failed to restore: ${error.message}`);
      setPickedFile(null);
    }
  };

  const hideDialog = () => {
    if (dialogType === "progress") return;
    setDialogVisible(false);
    if (pendingRestart) {
      setPendingRestart(false);
      if (Platform.OS === "android") BackHandler.exitApp();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Backup & Restore" />,
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
                <IconButton {...props} icon="download" onPress={handleExport} />
              )}
              onPress={handleExport}
            />
            <Divider />
            <List.Item
              title="Import Data"
              description="Restore data from a .rallxdb backup archive"
              style={{ minHeight: 76, justifyContent: "center" }}
              left={(props) => <List.Icon {...props} icon="database-import" />}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="upload"
                  onPress={handleImportClick}
                />
              )}
              onPress={handleImportClick}
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

      <Portal>
        <Dialog
          visible={dialogVisible}
          dismissable={dialogType !== "progress"}
          onDismiss={hideDialog}
        >
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Text
              variant="bodyMedium"
              style={{ marginBottom: dialogType === "progress" ? 16 : 0 }}
            >
              {dialogMessage}
            </Text>
            {dialogType === "progress" && (
              <ProgressBar progress={progress} color={theme.colors.primary} />
            )}
          </Dialog.Content>
          <Dialog.Actions>
            {dialogType === "confirm" && (
              <>
                <Button onPress={hideDialog}>Cancel</Button>
                <Button
                  onPress={handleRestoreConfirm}
                  textColor={theme.colors.error}
                >
                  Restore
                </Button>
              </>
            )}
            {(dialogType === "success" || dialogType === "error") && (
              <Button onPress={hideDialog}>OK</Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
