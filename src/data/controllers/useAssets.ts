import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Asset from "../models/Asset";

export interface AssetsData {
  assets: Asset[];
  totalBalance: number;
  isLoading: boolean;
}

export function useAssets(onlyIncludedInBal = true): AssetsData {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const clauses = [Q.where("is_deleted", false)];
    if (onlyIncludedInBal) clauses.push(Q.where("include_in_bal", true));

    const subscription = database
      .get<Asset>("assets")
      .query(...clauses)
      .observeWithColumns([
        "name",
        "type",
        "balance",
        "min_balance",
        "include_in_bal",
        "interest_rate",
        "maturity_date",
        "updated_at",
      ])
      .subscribe((data) => {
        setAssets(data);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [onlyIncludedInBal]);

  const totalBalance = assets.reduce((sum, a) => sum + a.balance, 0);

  return { assets, totalBalance, isLoading };
}
