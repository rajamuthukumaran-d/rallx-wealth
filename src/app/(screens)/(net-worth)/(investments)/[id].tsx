import { ScreenHeader } from "@/components/ScreenHeader";
import {
  InvestmentFormData,
  createInvestment,
  deleteInvestment,
  updateInvestment,
  useInvestment,
} from "@/data/controllers/useInvestments";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  Menu,
  Portal,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const INVESTMENT_TYPES = [
  { label: "Stock", value: "stock" },
  { label: "Mutual Fund", value: "mutual_fund" },
  { label: "Crypto", value: "crypto" },
  { label: "ETF", value: "etf" },
  { label: "Bonds", value: "bonds" },
];

export default function InvestmentFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdding = id === "new";

  const { investment } = useInvestment(isAdding ? "" : id);
  const formPopulated = useRef(false);

  const [name, setName] = useState("");
  const [investType, setInvestType] = useState("");
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [platform, setPlatform] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!investment || formPopulated.current) return;
    formPopulated.current = true;
    setName(investment.name);
    setInvestType(investment.type);
    setSymbol(investment.symbol ?? "");
    setPlatform(investment.platform ?? "");
    setInvestedAmount(investment.investedAmount ? String(investment.investedAmount) : "");
    setCurrentValue(investment.currentValue ? String(investment.currentValue) : "");
    setQuantity(investment.quantity != null ? String(investment.quantity) : "");
  }, [investment]);

  const selectedTypeLabel = INVESTMENT_TYPES.find((t) => t.value === investType)?.label ?? "";

  const formData = (): InvestmentFormData => ({
    name: name.trim(),
    type: investType,
    symbol: symbol.trim() || undefined,
    platform: platform.trim() || undefined,
    investedAmount: parseFloat(investedAmount) || 0,
    currentValue: parseFloat(currentValue) || 0,
    quantity: quantity ? parseFloat(quantity) : undefined,
  });

  const handleSave = async () => {
    if (!name.trim() || !investType) return;
    setSaving(true);
    try {
      if (isAdding) {
        await createInvestment(formData());
      } else {
        await updateInvestment(id, formData());
      }
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!investment) return;
    setDeleting(true);
    try {
      await deleteInvestment(investment);
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
              title={isAdding ? "Add Investment" : "Edit Investment"}
              isTransparent
              rightActions={deleteAction}
            />
          ),
        }}
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: "center" }}>Delete Investment?</Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {`"${name}" will be removed from your investments. This cannot be undone.`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button textColor={theme.colors.error} loading={deleting} onPress={handleDelete}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Main fields */}
          <View className="rounded-3xl p-4 gap-3 mb-4" style={sectionBg}>
            <TextInput
              label="Investment Name"
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
                    label="Investment Type"
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
              {INVESTMENT_TYPES.map((t) => (
                <Menu.Item
                  key={t.value}
                  title={t.label}
                  onPress={() => {
                    setInvestType(t.value);
                    setTypeMenuVisible(false);
                  }}
                />
              ))}
            </Menu>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Ticker / Symbol"
                  value={symbol}
                  onChangeText={setSymbol}
                  mode="outlined"
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Platform"
                  value={platform}
                  onChangeText={setPlatform}
                  mode="outlined"
                  style={inputStyle}
                />
              </View>
            </View>
          </View>

          {/* Valuation fields */}
          <View className="rounded-3xl p-4 gap-3" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Valuation
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Amount Invested"
                  value={investedAmount}
                  onChangeText={setInvestedAmount}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="$" />}
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Current Value"
                  value={currentValue}
                  onChangeText={setCurrentValue}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  left={<TextInput.Affix text="$" />}
                  style={inputStyle}
                />
              </View>
            </View>

            <TextInput
              label="Quantity / Units (optional)"
              value={quantity}
              onChangeText={setQuantity}
              mode="outlined"
              keyboardType="decimal-pad"
              style={inputStyle}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !name.trim() || !investType}
            className="rounded-full mt-6 py-1"
            icon="content-save"
          >
            {isAdding ? "Save Investment" : "Save Changes"}
          </Button>
        </ScrollView>
      </View>
    </>
  );
}
