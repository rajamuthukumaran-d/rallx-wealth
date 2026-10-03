import { useRouter as useExpoRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  Avatar,
  Button,
  Divider,
  List,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsScreen() {
  const router = useExpoRouter();
  const theme = useTheme();
  // Using generic state for mock purposes
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.colors.background }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 pt-2 pb-8 mt-8">
        <PageHeader title="Settings" />

        <View className="items-center justify-center py-6">
          <Avatar.Icon size={96} icon="account" />
          <Text
            className="text-[22px] mt-4"
            style={{ color: theme.colors.onSurface }}
          >
            Rajamuthukumaran D
          </Text>
        </View>

        <List.Section>
          <List.Subheader
            style={{
              color: theme.colors.primary,
              paddingLeft: 0,
              fontSize: 14,
            }}
          >
            General
          </List.Subheader>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Dark Mode"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
              )}
            />
            <Divider />
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Primary Currency"
              description="Indian Rupee (₹)"
              left={(props) => <List.Icon {...props} icon="currency-usd" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </View>
        </List.Section>

        <List.Section>
          <List.Subheader
            style={{
              color: theme.colors.primary,
              paddingLeft: 0,
              fontSize: 14,
            }}
          >
            Data Management
          </List.Subheader>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Backup & Restore"
              // description="Export/Import SQLite Database"
              left={(props) => <List.Icon {...props} icon="database-export" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("/(screens)/(backup-restore)")}
            />
            <Divider />
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Manage Categories"
              left={(props) => <List.Icon {...props} icon="shape" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("/(screens)/(category)")}
            />
            <Divider />
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Manage Budgets"
              left={(props) => <List.Icon {...props} icon="wallet" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Auto Deductions"
              left={(props) => <List.Icon {...props} icon="autorenew" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Spending Stats"
              left={(props) => <List.Icon {...props} icon="chart-bar" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {}}
            />
          </View>
        </List.Section>

        <List.Section>
          <List.Subheader
            style={{
              color: theme.colors.primary,
              paddingLeft: 0,
              fontSize: 14,
            }}
          >
            Security
          </List.Subheader>
          <View
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: theme.colors.elevation.level1 }}
          >
            <List.Item
              style={{ minHeight: 76, justifyContent: "center" }}
              title="Biometric Login"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={isBiometricEnabled}
                  onValueChange={setIsBiometricEnabled}
                />
              )}
            />
          </View>
        </List.Section>

        <View className="py-6 items-center">
          <Button
            mode="outlined"
            icon="logout"
            textColor={theme.colors.error}
            style={{
              borderColor: theme.colors.error,
              width: "100%",
              maxWidth: 320,
            }}
            onPress={() => {}}
          >
            Sign Out
          </Button>
          <Text
            className="text-xs mt-4"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Version 2.4.0 (Build 302)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
