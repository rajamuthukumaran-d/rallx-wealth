import { ScreenHeader } from "@/components/ScreenHeader";
import { database } from "@/data";
import Debt from "@/data/models/Debt";
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

const DEBT_TYPES = [
  { label: "Loan", value: "loan" },
  { label: "Credit Card", value: "credit_card" },
  { label: "EMI", value: "emi" },
  { label: "Pay Later", value: "pay_later" },
  { label: "Other", value: "other" },
];

const DEBT_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Paid", value: "paid" },
  { label: "Settled", value: "settled" },
];

export default function DebtFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdding = id === "new";

  const debtRef = useRef<Debt | null>(null);
  const formPopulated = useRef(false);

  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState("");
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [status, setStatus] = useState("active");
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [autoDebit, setAutoDebit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAdding) return;

    const subscription = database
      .get<Debt>("debts")
      .findAndObserve(id)
      .subscribe({
        next: (debt) => {
          debtRef.current = debt;
          if (!formPopulated.current) {
            formPopulated.current = true;
            setName(debt.name);
            setDebtType(debt.type);
            setStatus(debt.status);
            setTotalAmount(debt.totalAmount ? String(debt.totalAmount) : "");
            setRemainingAmount(
              debt.remainingAmount ? String(debt.remainingAmount) : ""
            );
            setEmiAmount(debt.emiAmount ? String(debt.emiAmount) : "");
            setInterestRate(
              debt.interestRate != null ? String(debt.interestRate) : ""
            );
            if (debt.dueDate) setDueDate(new Date(debt.dueDate));
            setAutoDebit(debt.autoDebit);
          }
        },
        error: console.error,
      });

    return () => subscription.unsubscribe();
  }, [id, isAdding]);

  const selectedTypeLabel =
    DEBT_TYPES.find((t) => t.value === debtType)?.label ?? "";

  const selectedStatusLabel =
    DEBT_STATUSES.find((s) => s.value === status)?.label ?? "";

  const onDateChange = (_: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) setDueDate(date);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const handleSave = async () => {
    if (!name.trim() || !debtType) return;
    setSaving(true);
    try {
      await database.write(async () => {
        if (isAdding) {
          await database.get<Debt>("debts").create((record) => {
            record.name = name.trim();
            record.type = debtType;
            record.status = status;
            record.totalAmount = parseFloat(totalAmount) || 0;
            record.remainingAmount = parseFloat(remainingAmount) || 0;
            record.autoDebit = autoDebit;
            record.isDeleted = false;
            if (emiAmount) record.emiAmount = parseFloat(emiAmount);
            if (interestRate) record.interestRate = parseFloat(interestRate);
            if (dueDate) record.dueDate = dueDate.getTime() as any;
          });
        } else {
          const debt = await database.get<Debt>("debts").find(id);
          await debt.update((record) => {
            record.name = name.trim();
            record.type = debtType;
            record.status = status;
            record.totalAmount = parseFloat(totalAmount) || 0;
            record.remainingAmount = parseFloat(remainingAmount) || 0;
            record.autoDebit = autoDebit;
            record.emiAmount = emiAmount ? parseFloat(emiAmount) : undefined;
            record.interestRate = interestRate
              ? parseFloat(interestRate)
              : undefined;
            record.dueDate = dueDate ? (dueDate.getTime() as any) : undefined;
          });
        }
      });
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!debtRef.current) return;
    setDeleting(true);
    try {
      await database.write(async () => {
        await debtRef.current!.update((record) => {
          record.isDeleted = true;
        });
      });
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
              title={isAdding ? "Add New Debt" : "Edit Debt"}
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
            Delete Debt?
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {`"${name}" will be removed from your debt list. This cannot be undone.`}
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
          {/* Core fields */}
          <View className="rounded-3xl p-4 gap-3 mb-4" style={sectionBg}>
            <TextInput
              label="Debt Name"
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
                    label="Debt Type"
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
              {DEBT_TYPES.map((t) => (
                <Menu.Item
                  key={t.value}
                  title={t.label}
                  onPress={() => {
                    setDebtType(t.value);
                    setTypeMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Total / Principal"
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Remaining Balance"
                  value={remainingAmount}
                  onChangeText={setRemainingAmount}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                  style={inputStyle}
                />
              </View>
            </View>
          </View>

          {/* Payment details */}
          <View className="rounded-3xl p-4 gap-3 mb-4" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Payment Details (Optional)
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="EMI / Monthly Payment"
                  value={emiAmount}
                  onChangeText={setEmiAmount}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="₹" />}
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Interest Rate (APR)"
                  value={interestRate}
                  onChangeText={setInterestRate}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  right={<TextInput.Affix text="%" />}
                  style={inputStyle}
                />
              </View>
            </View>

            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                label="Due Date"
                value={dueDate ? formatDate(dueDate) : ""}
                mode="outlined"
                editable={false}
                pointerEvents="none"
                right={<TextInput.Icon icon="calendar" />}
                style={inputStyle}
              />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate ?? new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Status & options */}
          <View className="rounded-3xl p-4 gap-3" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Options
            </Text>

            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setStatusMenuVisible(true)}>
                  <TextInput
                    label="Status"
                    value={selectedStatusLabel}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    right={<TextInput.Icon icon="chevron-down" />}
                    style={inputStyle}
                  />
                </TouchableOpacity>
              }
            >
              {DEBT_STATUSES.map((s) => (
                <Menu.Item
                  key={s.value}
                  title={s.label}
                  onPress={() => {
                    setStatus(s.value);
                    setStatusMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <View
              className="flex-row items-center justify-between rounded-2xl p-4"
              style={{ backgroundColor: theme.colors.elevation.level3 }}
            >
              <View className="flex-1 mr-4">
                <Text
                  className="text-sm font-medium"
                  style={{ color: theme.colors.onSurface }}
                >
                  Auto-Debit
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  Payment is automatically deducted
                </Text>
              </View>
              <Switch value={autoDebit} onValueChange={setAutoDebit} />
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !debtType || !totalAmount || !remainingAmount}
            className="rounded-full mt-6 py-1"
            icon="content-save"
          >
            {isAdding ? "Save Debt" : "Save Changes"}
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
