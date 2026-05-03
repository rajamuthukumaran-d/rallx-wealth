import { useEffect, useState } from "react";
import { getUsdToInrRate } from "@/utils/stockPrice";

export function useUsdToInr(): { rate: number | null; loading: boolean } {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsdToInrRate()
      .then(setRate)
      .finally(() => setLoading(false));
  }, []);

  return { rate, loading };
}
