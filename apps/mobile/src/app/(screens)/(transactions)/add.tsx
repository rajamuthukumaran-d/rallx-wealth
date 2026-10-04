import { NumberField } from "@/components/NumberField";
import { ScreenHeader } from "@/components/ScreenHeader";
import { createTransaction } from "@/data/controllers/useTransactions";
import { formatIndian, parseIndian } from "@rallx-wealth/utils-frontend";
import { pickerStore } from "@/utils/pickerStore";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Divider,
  IconButton,
  List,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

interface PaymentEntry {
  key: string;
  assetId: string;
  assetLabel: string;
  amount: string;
}

const HEADER_TITLES: Record<string, string> = {
  expense: "Add Expense",
  income: "Add Income",
  transfer: "Add Transfer",
};

export default function AddTransactionScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [isRefund, setIsRefund] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payments, setPayments] = useState<PaymentEntry[]>([
    { key: "0", assetId: "", assetLabel: "", amount: "" },
  ]);

  useEffect(() => () => pickerStore.clear(), []);

  const totalAmount = payments.reduce(
    (sum, p) => sum + parseIndian(p.amount),
    0,
  );

  const isValid =
    categoryId !== "" &&
    payments.length > 0 &&
    payments.every((p) => p.assetId !== "" && parseIndian(p.amount) > 0);

  const onDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selected) setDate(selected);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const openCategoryPicker = () => {
    pickerStore.register((id, label) => {
      setCategoryId(id);
      setCategoryLabel(label);
    });
    router.push(`/(screens)/(transactions)/category-picker?type=${type}`);
  };

  const openAssetPicker = (key: string) => {
    pickerStore.register((id, label) => {
      setPayments((prev) =>
        prev.map((p) =>
          p.key === key ? { ...p, assetId: id, assetLabel: label } : p,
        ),
      );
    });
    router.push("/(screens)/(transactions)/asset-picker");
  };

  const addPaymentRow = () => {
    setPayments((prev) => [
      ...prev,
      { key: Date.now().toString(), assetId: "", assetLabel: "", amount: "" },
    ]);
  };

  const removePaymentRow = (key: string) => {
    setPayments((prev) => prev.filter((p) => p.key !== key));
  };

  const updatePaymentAmount = (key: string, value: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.key === key ? { ...p, amount: value } : p)),
    );
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await createTransaction({
        name: name.trim(),
        type,
        date: date.getTime(),
        categoryId,
        note: note.trim(),
        isRefund,
        payments: payments.map((p) => ({
          assetId: p.assetId,
          amount: parseIndian(p.amount),
        })),
      });
      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Save failed",
        "Could not save the transaction. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const sectionBg = { backgroundColor: theme.colors.elevation.level1 };
  const inputBg = { backgroundColor: theme.colors.elevation.level2 };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader title={HEADER_TITLES[type] ?? "Add Transaction"} />
          ),
        }}
      />

      <View
        className="flex-1"
        style={{ backgroundColor: theme.colors.background }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Name */}
          <View className="rounded-3xl p-4 mb-4" style={sectionBg}>
            <TextInput
              label="Name"
              placeholder="Enter transaction name..."
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={inputBg}
            />
          </View>

          {/* Type selector */}
          <View className="rounded-3xl p-4 mb-4" style={sectionBg}>
            <SegmentedButtons
              value={type}
              onValueChange={(v) => {
                setType(v);
                setCategoryId("");
                setCategoryLabel("");
              }}
              buttons={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" },
                { value: "transfer", label: "Transfer" },
              ]}
            />
          </View>

          {/* Category / Date / Note */}
          <View className="rounded-3xl overflow-hidden mb-4" style={sectionBg}>
            <TouchableOpacity onPress={openCategoryPicker}>
              <List.Item
                title="Category"
                left={(props) => <List.Icon {...props} icon="shape" />}
                right={() => (
                  <View className="flex-row items-center gap-1">
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {categoryLabel || "Select"}
                    </Text>
                    <List.Icon
                      icon="chevron-right"
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}
                style={{ minHeight: 56 }}
              />
            </TouchableOpacity>

            <Divider />

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <List.Item
                title="Date"
                left={(props) => <List.Icon {...props} icon="calendar" />}
                right={() => (
                  <View className="flex-row items-center gap-1">
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {formatDate(date)}
                    </Text>
                    <List.Icon
                      icon="chevron-right"
                      color={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}
                style={{ minHeight: 56 }}
              />
            </TouchableOpacity>

            <Divider />

            {showNote || note.length > 0 ? (
              <View className="flex-row items-start px-4 py-3">
                <List.Icon
                  icon="note-text-outline"
                  color={theme.colors.onSurfaceVariant}
                  style={{ minHeight: 20 }}
                />
                <TextInput
                  placeholder="Add a note..."
                  value={note}
                  onChangeText={setNote}
                  mode="flat"
                  multiline
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    minHeight: 80,
                  }}
                  autoFocus={showNote && note.length === 0}
                  onBlur={() => {
                    if (!note.trim()) setShowNote(false);
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity onPress={() => setShowNote(true)}>
                <List.Item
                  title="Add a note..."
                  titleStyle={{ color: theme.colors.onSurfaceVariant }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="note-text-outline"
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                  style={{ minHeight: 56 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Total Amount */}
          <View
            className="items-center py-5 rounded-3xl mb-4"
            style={sectionBg}
          >
            <Text
              variant="labelSmall"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Total Amount
            </Text>
            <Text
              variant="headlineMedium"
              style={{ color: theme.colors.onSurface, marginTop: 4 }}
            >
              {formatIndian(totalAmount.toFixed(2))}
            </Text>
          </View>

          {/* Payment Methods */}
          <View className="rounded-3xl p-4 mb-4" style={sectionBg}>
            <View className="flex-row justify-between items-center mb-3">
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Payment Methods
              </Text>
              <Button mode="text" compact icon="plus" onPress={addPaymentRow}>
                Add Split
              </Button>
            </View>

            {payments.map((payment) => (
              <View
                key={payment.key}
                className="flex-row items-center gap-2 mb-3"
              >
                <View className="flex-1">
                  <TouchableOpacity
                    onPress={() => openAssetPicker(payment.key)}
                  >
                    <TextInput
                      label="Account"
                      value={payment.assetLabel}
                      mode="outlined"
                      editable={false}
                      pointerEvents="none"
                      right={<TextInput.Icon icon="chevron-down" />}
                      style={inputBg}
                    />
                  </TouchableOpacity>
                </View>
                <View className="flex-1">
                  <NumberField
                    label="Amount"
                    value={payment.amount}
                    onChangeText={(v) => updatePaymentAmount(payment.key, v)}
                    style={inputBg}
                  />
                </View>
                {payments.length > 1 && (
                  <IconButton
                    icon="close"
                    size={20}
                    onPress={() => removePaymentRow(payment.key)}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Is Refund */}
          <View
            className="flex-row items-center justify-between rounded-3xl px-4 py-3 mb-6"
            style={sectionBg}
          >
            <View className="flex-row items-center gap-3">
              <List.Icon icon="refresh" color={theme.colors.onSurfaceVariant} />
              <Text style={{ color: theme.colors.onSurface }}>Is Refund</Text>
            </View>
            <Switch value={isRefund} onValueChange={setIsRefund} />
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !isValid}
            className="rounded-full py-1"
            icon="content-save"
          >
            Save Transaction
          </Button>
        </ScrollView>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onDateChange}
        />
      )}
    </>
  );
}
