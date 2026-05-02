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

export interface AssetRecord {
  asset: Asset | null;
  isLoading: boolean;
}

export function useAsset(id: string): AssetRecord {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const subscription = database
      .get<Asset>("assets")
      .findAndObserve(id)
      .subscribe({
        next: (record) => {
          setAsset(record);
          setIsLoading(false);
        },
        error: (e) => {
          console.error(e);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [id]);

  return { asset, isLoading };
}

export interface AssetFormData {
  name: string;
  type: string;
  balance: number;
  minBalance: number;
  includeInBal: boolean;
  maturityDate?: number;
  interestRate?: number;
}

function applyAssetFields(record: Asset, data: AssetFormData) {
  record.name = data.name;
  record.type = data.type;
  record.balance = data.balance;
  record.minBalance = data.minBalance;
  record.includeInBal = data.includeInBal;
  record.maturityDate = data.maturityDate as any;
  record.interestRate = data.interestRate;
}

export async function createAsset(data: AssetFormData): Promise<void> {
  await database.write(async () => {
    await database.get<Asset>("assets").create((record) => {
      applyAssetFields(record, data);
      record.isDeleted = false;
    });
  });
}

export async function updateAsset(id: string, data: AssetFormData): Promise<void> {
  await database.write(async () => {
    const record = await database.get<Asset>("assets").find(id);
    await record.update((r) => applyAssetFields(r, data));
  });
}

export async function deleteAsset(asset: Asset): Promise<void> {
  await database.write(async () => {
    await asset.update((r) => {
      r.isDeleted = true;
    });
  });
}
