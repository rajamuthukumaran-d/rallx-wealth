import { getUsdToInrRate } from "@/utils/stockPrice";
import { createContext, useContext, useEffect, useState } from "react";

interface ExchangeRateContextValue {
  usdToInr: number | null;
  loading: boolean;
}

const ExchangeRateContext = createContext<ExchangeRateContextValue>({
  usdToInr: null,
  loading: true,
});

export function ExchangeRateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usdToInr, setUsdToInr] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsdToInrRate()
      .then(setUsdToInr)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ExchangeRateContext.Provider value={{ usdToInr, loading }}>
      {children}
    </ExchangeRateContext.Provider>
  );
}

export function useExchangeRate(): ExchangeRateContextValue {
  return useContext(ExchangeRateContext);
}
