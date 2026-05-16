import { NumberField } from "@/components/NumberField";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  AssetFormData,
  createAsset,
  deleteAsset,
  updateAsset,
  useAsset,
} from "@/data/controllers/useAssets";
import { formatIndian, parseIndian } from "@/utils/numberFormat";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, TouchableOpacity, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  Menu,
  Portal,
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

export default function AssetFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdding = id === "new";

  const { asset } = useAsset(isAdding ? "" : id);
  const formPopulated = useRef(false);

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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!asset || formPopulated.current) return;
    formPopulated.current = true;
    setName(asset.name);
    setAssetType(asset.type);
    setBalance(asset.balance ? formatIndian(String(asset.balance)) : "");
    setMinBalance(asset.minBalance ? formatIndian(String(asset.minBalance)) : "");
    setIncludeInBal(asset.includeInBal);
    if (asset.maturityDate) setMaturityDate(new Date(asset.maturityDate));
    if (asset.interestRate) setInterestRate(formatIndian(String(asset.interestRate)));
  }, [asset]);

  const selectedTypeLabel =
    ASSET_TYPES.find((t) => t.value === assetType)?.label ?? "";

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setMaturityDate(date);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formData = (): AssetFormData => ({
    name: name.trim(),
    type: assetType,
    balance: parseIndian(balance),
    minBalance: parseIndian(minBalance),
    includeInBal,
    maturityDate: maturityDate ? maturityDate.getTime() : undefined,
    interestRate: interestRate ? parseIndian(interestRate) : undefined,
  });

  const handleSave = async () => {
    if (!name.trim() || !assetType) return;
    setSaving(true);
    try {
      if (isAdding) {
        await createAsset(formData());
      } else {
        await updateAsset(id, formData());
      }
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!asset) return;
    setDeleting(true);
    try {
      await deleteAsset(asset);
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const inputStyle = { backgroundColor: theme.colors.elevation.level2 };
  const sectionBg = { backgroundColor: theme.colors.elevation.level1 };

  const deleteAction = !isAdding ? (
    <Appbar.Action
      icon="delete-outline"
      onPress={() => setDeleteDialogVisible(true)}
      iconColor={theme.colors.error}
    />
  ) : undefined;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader
              title={isAdding ? "Add New Asset" : "Edit Asset"}
              isTransparent
              rightActions={deleteAction}
            />
          ),
        }}
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: "center" }}>
            Delete Asset?
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {`"${name}" will be removed from your asset list. This cannot be undone.`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button
              textColor={theme.colors.error}
              loading={deleting}
              onPress={handleDelete}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main form */}
          <View className="rounded-3xl p-4 gap-3 mb-4" style={sectionBg}>
            <TextInput
              label="Asset Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={inputStyle}
            />

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

            <View className="flex-row gap-3">
              <View className="flex-1">
                <NumberField
                  label="Current Balance"
                  value={balance}
                  onChangeText={setBalance}
                  prefix="₹"
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <NumberField
                  label="Minimum Balance"
                  value={minBalance}
                  onChangeText={setMinBalance}
                  prefix="₹"
                  style={inputStyle}
                />
              </View>
            </View>

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
          <View className="rounded-3xl p-4 gap-3" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Fixed Deposit Details (Optional)
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <TextInput
                    label="Maturity Date"
                    value={maturityDate ? formatDate(maturityDate) : ""}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    right={
                      maturityDate ? (
                        <TextInput.Icon
                          icon="close"
                          onPress={() => setMaturityDate(null)}
                        />
                      ) : (
                        <TextInput.Icon icon="calendar" />
                      )
                    }
                    style={inputStyle}
                  />
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <NumberField
                  label="Interest Rate (APY)"
                  value={interestRate}
                  onChangeText={setInterestRate}
                  suffix="%"
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

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !assetType}
            className="rounded-full mt-6 py-1"
            icon="content-save"
          >
            {isAdding ? "Save Asset" : "Save Changes"}
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
