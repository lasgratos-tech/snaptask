import { AirbnbLiteExecutor } from "../executors/airbnbLiteExecutor.js";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const photos = [
  { bytes: 100, format: "image/jpeg", name: "kitchen.jpg" },
  { bytes: 120, format: "image/png", name: "bathroom.png" },
];

// Test 1: photos horodatées présentes
{
  const executor = new AirbnbLiteExecutor(() => "2026-01-01T00:00:00Z");
  const result = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  const timestamped = result.outputs.timestampedPhotos as Array<{
    name: string;
    timestamp: string;
  }>;
  assert(timestamped.length === 2, "TIMESTAMPED_PHOTOS_MISSING");
  assert(
    timestamped.every((p) => p.timestamp === "2026-01-01T00:00:00Z"),
    "TIMESTAMP_NOT_APPLIED",
  );
}

// Test 2: livrable figé (résultat déterministe pour même entrée)
{
  const executor = new AirbnbLiteExecutor(() => "2026-01-01T00:00:00Z");
  const r1 = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  const r2 = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  assert(r1.outputs.resultRef === r2.outputs.resultRef, "RESULT_NOT_FIXED");
}

// Test 3: aucune persistance réutilisable
{
  const executor = new AirbnbLiteExecutor(() => "2026-01-01T00:00:00Z");
  const r1 = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  const r2 = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  assert(r1.outputs.timestampedPhotos !== r2.outputs.timestampedPhotos, "STATE_SHARED");
}

// Test 4: aucune donnée partagée entre exécutions
{
  const executor = new AirbnbLiteExecutor(() => "2026-01-01T00:00:00Z");
  const r1 = executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  const r2 = executor.execute("SNAPTASK-TASK-EDL-APRES-V2", { photos });
  assert(
    r1.outputs.archiveItems !== r2.outputs.archiveItems,
    "ARCHIVE_ITEMS_SHARED",
  );
}

// Test 5: inputs non modifiés
{
  const original = JSON.stringify(photos);
  const executor = new AirbnbLiteExecutor(() => "2026-01-01T00:00:00Z");
  executor.execute("SNAPTASK-TASK-EDL-AVANT-V2", { photos });
  assert(JSON.stringify(photos) === original, "INPUTS_MUTATED");
}
