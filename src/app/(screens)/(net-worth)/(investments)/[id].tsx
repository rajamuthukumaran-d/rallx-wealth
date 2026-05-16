import { ScreenHeader } from "@/components/ScreenHeader";
import {
  InvestmentFormData,
  createInvestment,
  deleteInvestment,
  updateInvestment,
  useInvestment,
} from "@/data/controllers/useInvestments";
import { EXCHANGES, fetchStockQuote } from "@/utils/stockPrice";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import {
  Appbar,
  Button,
  Dialog,
  HelperText,
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
  { label: "Gold", value: "gold" },
  { label: "Silver", value: "silver" },
];

function mapInstrumentType(instrumentType: string): string {
  switch (instrumentType.toUpperCase()) {
    case "EQUITY":
      return "stock";
    case "ETF":
      return "etf";
    case "CRYPTOCURRENCY":
      return "crypto";
    case "MUTUALFUND":
      return "mutual_fund";
    case "BOND":
      return "bonds";
    default:
      return "";
  }
}

export default function InvestmentFormScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    id,
    prefillName,
    prefillSymbol,
    prefillExchange,
    prefillPlatform,
    prefillCurrency,
    prefillType,
  } = useLocalSearchParams<{
    id: string;
    prefillName?: string;
    prefillSymbol?: string;
    prefillExchange?: string;
    prefillPlatform?: string;
    prefillCurrency?: string;
    prefillType?: string;
  }>();
  const isAdding = id === "new";

  const { investment } = useInvestment(isAdding ? "" : id);
  const formPopulated = useRef(false);
  const lastUnitPrice = useRef<number | null>(null);
  const currentValueDebounce = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [name, setName] = useState(isAdding ? (prefillName ?? "") : "");
  const [investType, setInvestType] = useState(isAdding ? (prefillType ?? "") : "");
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [symbol, setSymbol] = useState(isAdding ? (prefillSymbol ?? "") : "");
  const [exchange, setExchange] = useState(
    isAdding ? (prefillExchange || "NSE") : "NSE",
  );
  const [exchangeMenuVisible, setExchangeMenuVisible] = useState(false);
  const [currency, setCurrency] = useState(isAdding ? (prefillCurrency ?? "") : "");
  const [platform, setPlatform] = useState(isAdding ? (prefillPlatform ?? "") : "");
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgUnitValue, setAvgUnitValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [fetchedMeta, setFetchedMeta] = useState<{
    name: string;
    currency: string;
  } | null>(null);

  useEffect(() => {
    if (!investment || formPopulated.current) return;
    formPopulated.current = true;
    setName(investment.name);
    setInvestType(investment.type);
    setSymbol(investment.symbol ?? "");
    setExchange(investment.exchange ?? "NSE");
    setCurrency(investment.currency ?? "");
    setPlatform(investment.platform ?? "");
    setInvestedAmount(
      investment.investedAmount ? String(investment.investedAmount) : "",
    );
    setCurrentValue(
      investment.currentValue ? String(investment.currentValue) : "",
    );
    setQuantity(investment.quantity != null ? String(investment.quantity) : "");
    // Derive unit price so quantity changes can update currentValue without a fresh API call
    if (
      investment.quantity &&
      investment.quantity > 0 &&
      investment.currentValue
    ) {
      lastUnitPrice.current = investment.currentValue / investment.quantity;
    }
  }, [investment]);

  // Recalculate invested amount when avg unit value or quantity changes
  const handleAvgUnitValueChange = (val: string) => {
    setAvgUnitValue(val);
    const avg = parseFloat(val);
    const qty = parseFloat(quantity);
    if (!isNaN(avg) && !isNaN(qty) && qty > 0) {
      setInvestedAmount(String(avg * qty));
    }
  };

  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const avg = parseFloat(avgUnitValue);
    const qty = parseFloat(val);
    if (!isNaN(avg) && avg > 0 && !isNaN(qty) && qty > 0) {
      setInvestedAmount(String(avg * qty));
    }
    if (currentValueDebounce.current)
      clearTimeout(currentValueDebounce.current);
    if (lastUnitPrice.current !== null && !isNaN(qty) && qty > 0) {
      currentValueDebounce.current = setTimeout(() => {
        setCurrentValue(String(lastUnitPrice.current! * qty));
      }, 500);
    }
  };

  // Clear avg unit value if user edits invested amount directly
  const handleInvestedAmountChange = (val: string) => {
    setInvestedAmount(val);
    setAvgUnitValue("");
  };

  const selectedTypeLabel =
    INVESTMENT_TYPES.find((t) => t.value === investType)?.label ?? "";
  const selectedExchangeLabel =
    EXCHANGES.find((e) => e.value === exchange)?.label ?? "";

  const canFetchPrice = !!symbol.trim() && !!exchange;

  const handleFetchPrice = async () => {
    if (!canFetchPrice) return;
    setFetchingPrice(true);
    setPriceError(null);
    setFetchedMeta(null);
    try {
      const quote = await fetchStockQuote(symbol.trim(), exchange);
      lastUnitPrice.current = quote.price;
      const qty = parseFloat(quantity) || null;
      const marketValue = qty != null ? quote.price * qty : quote.price;
      setCurrentValue(String(marketValue));
      setCurrency(quote.currency);
      setFetchedMeta({ name: quote.name, currency: quote.currency });
      if (!name.trim()) setName(quote.name);
      const mappedType = mapInstrumentType(quote.instrumentType);
      if (mappedType) setInvestType(mappedType);
    } catch (e: any) {
      setPriceError(e?.message ?? "Failed to fetch price.");
    } finally {
      setFetchingPrice(false);
    }
  };

  const formData = (): InvestmentFormData => ({
    name: name.trim(),
    type: investType,
    symbol: symbol.trim() || undefined,
    exchange: exchange || undefined,
    currency: currency || undefined,
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
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Icon icon="alert-circle-outline" />
          <Dialog.Title style={{ textAlign: "center" }}>
            Delete Investment?
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {`"${name}" will be removed from your investments. This cannot be undone.`}
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
          {/* Identity */}
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

            <TextInput
              label="Platform"
              value={platform}
              onChangeText={setPlatform}
              mode="outlined"
              style={inputStyle}
            />
          </View>

          {/* Symbol + Exchange */}
          <View className="rounded-3xl p-4 gap-3 mb-4" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Market Data
            </Text>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Ticker / Symbol"
                  value={symbol}
                  onChangeText={(v) => {
                    setSymbol(v);
                    setPriceError(null);
                    setFetchedMeta(null);
                  }}
                  mode="outlined"
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <Menu
                  visible={exchangeMenuVisible}
                  onDismiss={() => setExchangeMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      onPress={() => setExchangeMenuVisible(true)}
                    >
                      <TextInput
                        label="Exchange"
                        value={selectedExchangeLabel}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        right={<TextInput.Icon icon="chevron-down" />}
                        style={inputStyle}
                      />
                    </TouchableOpacity>
                  }
                >
                  {EXCHANGES.map((e) => (
                    <Menu.Item
                      key={e.value}
                      title={e.label}
                      onPress={() => {
                        setExchange(e.value);
                        setExchangeMenuVisible(false);
                        setPriceError(null);
                        setFetchedMeta(null);
                      }}
                    />
                  ))}
                </Menu>
              </View>
            </View>

            <TextInput
              label="Currency"
              value={currency}
              onChangeText={setCurrency}
              mode="outlined"
              autoCapitalize="characters"
              placeholder="e.g. INR, USD"
              style={inputStyle}
            />

            {/* Fetch price button */}
            <View className="mt-2">
              <Button
                mode="outlined"
                onPress={handleFetchPrice}
                loading={fetchingPrice}
                disabled={fetchingPrice || !canFetchPrice}
                icon="refresh"
              >
                Fetch Current Price
              </Button>
              {fetchedMeta && (
                <HelperText type="info" visible>
                  {fetchedMeta.name} · {fetchedMeta.currency}
                </HelperText>
              )}
              {priceError && (
                <HelperText type="error" visible>
                  {priceError}
                </HelperText>
              )}
            </View>
          </View>

          {/* Valuation */}
          <View className="rounded-3xl p-4 gap-3" style={sectionBg}>
            <Text
              className="text-xs font-medium tracking-widest uppercase mb-1"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              Valuation
            </Text>

            <TextInput
              label="Quantity / Units"
              value={quantity}
              onChangeText={handleQuantityChange}
              mode="outlined"
              keyboardType="decimal-pad"
              style={inputStyle}
            />

            <View className="flex-row gap-3">
              <View className="flex-1">
                <TextInput
                  label="Avg. Unit Value"
                  value={avgUnitValue}
                  onChangeText={handleAvgUnitValueChange}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={inputStyle}
                />
              </View>
              <View className="flex-1">
                <TextInput
                  label="Amount Invested"
                  value={investedAmount}
                  onChangeText={handleInvestedAmountChange}
                  mode="outlined"
                  keyboardType="decimal-pad"
                  style={inputStyle}
                />
              </View>
            </View>

            <HelperText type="info" visible style={{ marginTop: -8 }}>
              Set Avg. Unit Value + Quantity to auto-calculate Amount Invested
            </HelperText>

            <TextInput
              label="Current Value"
              value={currentValue}
              onChangeText={setCurrentValue}
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
