/**
 * backupService.ts
 *
 * Handles exporting and importing the WatermelonDB SQLite database.
 *
 * Export strategy: zip all DB files (*.db, *.db-shm, *.db-wal) without
 * closing the database first — this captures WAL data as-is, which is the
 * recommended approach when the DB cannot be safely closed/checkpointed.
 *
 * Import strategy: unzip the archive into a temp directory, then overwrite
 * the live DB files. The app MUST be restarted after restore for WatermelonDB
 * to reinitialise from the new files.
 */

import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { zip, unzip } from "react-native-zip-archive";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** WatermelonDB default database name (no custom dbName was set). */
const DB_NAME = "watermelon";

/** All SQLite file names that make up a WAL-mode database. */
const DB_FILES = [`${DB_NAME}.db`, `${DB_NAME}.db-shm`, `${DB_NAME}.db-wal`];

/**
 * WatermelonDB stores SQLite files in different locations per platform:
 *  - iOS:     NSDocumentDirectory  → Paths.document
 *  - Android: getDatabasePath(name).replace("/databases","") strips the
 *             /databases subdir, landing files in the app data root, which
 *             is one level above Paths.document (the /files subdir).
 */
const DB_DIR: Directory =
  Platform.OS === "android"
    ? Paths.document.parentDirectory
    : Paths.document;

/** Extension used for the exported archive. */
const BACKUP_EXTENSION = "rallxdb";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strips the file:// prefix — react-native-zip-archive expects raw paths. */
const stripFileScheme = (uri: string) =>
  uri.startsWith("file://") ? uri.slice(7) : uri;

/** Builds a timestamp string suitable for file names. */
function buildTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Zips all WatermelonDB files (including WAL / SHM) and shares the archive
 * via the native share sheet.
 *
 * @param onProgress  Optional callback receiving a value in [0, 1].
 */
export async function exportDatabase(
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(0.05);

  // 1. Prepare a clean staging directory so zip only contains DB files.
  const stagingDir = new Directory(Paths.cache, "rallx_export_staging");
  stagingDir.create({ intermediates: true, idempotent: true });

  // 2. Copy each DB file that exists into the staging folder.
  let copied = 0;
  for (const fileName of DB_FILES) {
    const src = new File(DB_DIR, fileName);
    if (src.exists) {
      src.copy(stagingDir);
      copied++;
    }
  }

  if (copied === 0) {
    throw new Error("No database files found to export.");
  }

  onProgress?.(0.4);

  // 3. Zip the staging directory.
  const archiveName = `rallx_backup_${buildTimestamp()}.${BACKUP_EXTENSION}`;
  const archiveFile = new File(Paths.cache, archiveName);

  // react-native-zip-archive expects filesystem paths (no file:// prefix).
  await zip(stripFileScheme(stagingDir.uri), stripFileScheme(archiveFile.uri));

  onProgress?.(0.8);

  // 4. Clean up staging directory.
  stagingDir.delete();

  // 5. Share / save the archive.
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(archiveFile.uri, {
    mimeType: "application/zip",
    dialogTitle: "Save Rallx Backup",
    UTI: "com.pkware.zip-archive",
  });

  onProgress?.(1);

  // 6. Remove the temporary archive after sharing.
  archiveFile.delete();
}

// ---------------------------------------------------------------------------
// Import — file picker
// ---------------------------------------------------------------------------

/**
 * Opens the system document picker filtered to zip-like files.
 * Returns the picked file asset or null if the user cancelled.
 */
export async function pickBackupFile(): Promise<DocumentPicker.DocumentPickerAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    // Accept zip archives (our .rallxdb files are zips).
    type: ["application/zip", "application/x-zip-compressed", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0];
}

// ---------------------------------------------------------------------------
// Import — restore
// ---------------------------------------------------------------------------

/**
 * Restores the database from a previously exported zip archive.
 *
 * Steps:
 *  1. Unzip the archive into a temp directory.
 *  2. Validate that the expected DB file is present.
 *  3. Overwrite the live DB files with the ones from the archive.
 *  4. Clean up temp files.
 *
 * **The app must be restarted after this call** for WatermelonDB to
 * reinitialise with the restored data.
 *
 * @param file        Asset returned by `pickBackupFile`.
 * @param onProgress  Optional callback receiving a value in [0, 1].
 */
export async function restoreDatabase(
  file: DocumentPicker.DocumentPickerAsset,
  onProgress?: (progress: number) => void
): Promise<void> {
  onProgress?.(0.05);

  // 1. Unzip into a staging dir inside Paths.document (the filesDir whitelist).
  //    Extracting to Paths.cache causes a spurious READ-permission failure: files
  //    written by react-native-zip-archive can trigger an IOException inside
  //    FilePermissionModule.getInternalPathPermissions(), which returns an empty
  //    EnumSet (no permissions) instead of falling through to canRead()/canWrite().
  //    Files in Paths.document are always granted READ|WRITE by the internal-path
  //    whitelist, so bytes() on them works regardless.
  const extractDir = new Directory(Paths.document, "rallx_restore_staging");
  if (extractDir.exists) extractDir.delete();
  extractDir.create({ intermediates: true });

  await unzip(stripFileScheme(file.uri), stripFileScheme(extractDir.uri));

  onProgress?.(0.5);

  // 2. Validate that the main DB file exists in the archive.
  const extractedDb = new File(extractDir, `${DB_NAME}.db`);
  if (!extractedDb.exists) {
    extractDir.delete();
    throw new Error(
      `Invalid backup: "${DB_NAME}.db" not found inside the archive.`
    );
  }

  onProgress?.(0.65);

  // 3. Overwrite live DB files with the restored copies.
  //    We use bytes() + write() instead of copy()/move() because:
  //    - copy() and move() both fail when the destination is outside the Expo
  //      internal-path sandbox (DB_DIR on Android = app data root, above filesDir).
  //    - write() on an *existing* file passes the WRITE check (canWrite() = true).
  //    We do NOT delete the destination before writing: deleting makes the file
  //    non-existent, causing canWrite() to return false for external-sandbox paths.
  for (const fileName of DB_FILES) {
    const src = new File(extractDir, fileName);
    const dst = new File(DB_DIR, fileName);
    if (src.exists) {
      if (dst.exists) {
        const bytes = await src.bytes();
        dst.write(bytes);
      }
      // dst absent (WAL/SHM not yet initialised): skip — SQLite recreates them
      // when it opens the restored .db file.
    } else if (fileName !== `${DB_NAME}.db`) {
      // Backup has no WAL/SHM: delete any stale copies so the restored .db
      // isn't replayed against old WAL transactions.
      if (dst.exists) dst.delete();
    }
  }

  onProgress?.(0.9);

  // 4. Clean up temp extraction directory.
  extractDir.delete();

  onProgress?.(1);
}
