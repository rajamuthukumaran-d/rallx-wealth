import { ScreenHeader } from "@/components/ScreenHeader";
import { database } from "@/data";
import Asset from "@/data/models/Asset";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import {
  Button,
  Menu,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const ASSET_TYPES = [
  { label: "Bank Account", value: "bank" },
  { label: "Digital Wallet", value: "wallet" },
  { label: "Cash", value: "cash" },
  { label: "Fixed Deposit (FD)", value: "fd" },
  { label: "Stock / Equities", value: "stock" },
  { label: "Real Estate", value: "real_estate" },
];

export default function AddAssetScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [balance, setBalance] = useState("");
  const [minBalance, setMinBalance] = useState("");
  const [includeInBal, setIncludeInBal] = useState(true);
  const [maturityDate, setMaturityDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [interestRate, setInterestRate] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedTypeLabel =
    ASSET_TYPES.find((t) => t.value === assetType)?.label ?? "";

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setMaturityDate(date);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleSave = async () => {
    if (!name.trim() || !assetType) return;

    setSaving(true);
    try {
      await database.write(async () => {
        await database.get<Asset>("assets").create((record) => {
          record.name = name.trim();
          record.type = assetType;
          record.balance = parseFloat(balance) || 0;
          record.minBalance = parseFloat(minBalance) || 0;
          record.includeInBal = includeInBal;
          record.isDeleted = false;
          if (maturityDate) record.maturityDate = maturityDate.getTime();
          if (interestRate) record.interestRate = parseFloat(interestRate);
        });
      });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { backgroundColor: theme.colors.elevation.level2 };
  const sectionBg = { backgroundColor: theme.colors.elevation.level1 };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Add New Asset" isTransparent />,
        }}
      />
      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main form card */}
          <View
            className="rounded-3xl p-4 gap-3 mb-4"
            style={sectionBg}
          >
            {/* Asset Name */}
            <TextInput
              label="Asset Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={inputStyle}
            />

            {/* Asset Type dropdown */}
            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setTypeMenuVisible(true)}>
                  <TextInput
                    label="Asset Type"
                    value={selectedTypeLabel}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={inputStyle}
                  />
                </TouchableOpacity>
              }
            >
              {ASSET_TYPES.map((t) => (
                <Menu.Item
                  key={t.value}
                  title={t.label}
                  onPress={() => {
                    setAssetType(t.value);
                    setTypeMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            {/* Balance row */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Current Balance"
                  value={balance}
                  onChangeText={setBalance}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Minimum Balance"
                  value={minBalance}
                  onChangeText={setMinBalance}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                  style={inputStyle}
                />
              </View>
            </View>

            {/* Include in total balance */}
            <View
              className="flex-row items-center justify-between rounded-2xl p-4"
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            >
              <View className="flex-1 mr-4">
                <Text
                  className="text-sm font-medium"
                  style={{ color: theme.colors.onSurface }}
                >
                  Include in Total Balance
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Calculate this asset in global net worth
                </Text>
              </View>
              <Switch value={includeInBal} onValueChange={setIncludeInBal} />
            </View>
          </View>

          {/* Fixed Deposit Details */}
          <View
            className="rounded-3xl p-4 gap-3"
            style={sectionBg}
          >
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Fixed Deposit Details (Optional)
            </Text>

            <View className="flex-row gap-3">
              {/* Maturity Date */}
              <View className="flex-1">
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    label="Maturity Date"
                    value={maturityDate ? formatDate(maturityDate) : ""}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    right={<TextInput.Icon icon="calendar" />}
                    style={inputStyle}
                  />
                </TouchableOpacity>
              </View>

              {/* Interest Rate */}
              <View className="flex-1">
                <TextInput
                  label="Interest Rate (APY)"
                  value={interestRate}
                  onChangeText={setInterestRate}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  right={<TextInput.Affix text="%" />}
                  style={inputStyle}
                />
              </View>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={maturityDate ?? new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Save button */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !assetType}
            className="rounded-full mt-6 py-1"
            icon="content-save"
          >
            Save Asset
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
