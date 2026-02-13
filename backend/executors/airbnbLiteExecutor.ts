import type { TaskExecutor } from "../services/taskExecutor.js";

type PhotoInput = {
  bytes: number;
  format: string;
  name: string;
};

type ExecutionOutput = {
  resultRef: string;
  archiveRef: string;
  archiveItems: string[];
  timestampedPhotos: Array<{ name: string; timestamp: string }>;
  format: string;
};

/**
 * EXECUTOR — Airbnb Lite (preuves ponctuelles)
 * Références constitutionnelles :
 * - Section 6.3 : photos horodatées, document final figé
 * - Section 2 : stateless, déterministe, amnésique
 */
export class AirbnbLiteExecutor implements TaskExecutor {
  constructor(private readonly now: () => string) {}

  execute(taskId: string, inputs: Record<string, unknown>) {
    const photos = Array.isArray(inputs.photos)
      ? (inputs.photos as PhotoInput[])
      : [];

    const timestamp = this.now();
    const timestampedPhotos = photos.map((photo) => ({
      name: photo.name,
      timestamp,
    }));

    const archiveItems = [
      "summary.pdf",
      ...timestampedPhotos.map((p) => `photos/${p.timestamp}-${p.name}`),
    ];

    const baseRef = this.stableRef(taskId, timestampedPhotos.length);

    return {
      execution: { id: `exec-${baseRef}`, transactionId: `tx-${baseRef}` },
      outputs: {
        resultRef: `zip://${baseRef}`,
        archiveRef: `zip://${baseRef}`,
        archiveItems,
        timestampedPhotos,
        format: "ZIP",
      } satisfies ExecutionOutput,
    };
  }

  private stableRef(taskId: string, count: number): string {
    return `${taskId}-${count}`;
  }
}
