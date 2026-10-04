import type { AssetRecord } from "@rallx-wealth/types-database";

export function calculateAssetBalance(assets: readonly Pick<AssetRecord, "balance">[]): number {
  return assets.reduce((sum, asset) => sum + asset.balance, 0);
}
