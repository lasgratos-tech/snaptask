import type { TaskContract } from "../contracts/task.js";

/**
 * TASKS — Airbnb Lite (US) — Réintroduction par duplication
 * Références constitutionnelles :
 * - Section 8 : duplication par pays
 * - Section 9 : suppression sans réactivation
 * - Section 6 : périmètre Airbnb Lite
 */
const PHOTO_FORMATS = ["image/jpeg", "image/png"] as const;
const ROOM_ENUM = [
  "ENTREE",
  "SALON",
  "CHAMBRE",
  "CUISINE",
  "SALLE_DE_BAIN",
] as const;

export const AIRBNB_LITE_AVANT_TASK_US_RI: TaskContract = {
  id: "SNAPTASK-TASK-EDL-AVANT-V2-US-RI",
  version: "v2.1",
  category: "PROOF",
  price: { amount: 0, currency: "USD" },
  expectedResult: "ZIP_WITH_TIMESTAMPED_PHOTOS_AND_SUMMARY_PDF",
  inputs: [
    {
      name: "photos",
      kind: "FILE",
      constraints: {
        maxBytes: 10_000_000,
        minLength: 0,
        maxLength: 0,
        acceptedFormats: PHOTO_FORMATS,
        allowedValues: [],
        minItems: 1,
        maxItems: 50,
      },
    },
    {
      name: "pieces",
      kind: "ENUM",
      constraints: {
        maxBytes: 0,
        minLength: 0,
        maxLength: 0,
        acceptedFormats: [],
        allowedValues: ROOM_ENUM,
        minItems: 1,
        maxItems: 20,
      },
    },
  ],
  deliverableFormat: "ZIP",
  rcgCriteria: [
    { operator: "FILE_PRESENT", expected: ["archiveRef"] },
    { operator: "ARCHIVE_CONTAINS", expected: ["summary.pdf"] },
    { operator: "FIELDS_PRESENT", expected: ["timestampedPhotos"] },
  ],
};

export const AIRBNB_LITE_APRES_TASK_US_RI: TaskContract = {
  id: "SNAPTASK-TASK-EDL-APRES-V2-US-RI",
  version: "v2.1",
  category: "PROOF",
  price: { amount: 0, currency: "USD" },
  expectedResult: "ZIP_WITH_TIMESTAMPED_PHOTOS_AND_SUMMARY_PDF",
  inputs: [
    {
      name: "photos",
      kind: "FILE",
      constraints: {
        maxBytes: 10_000_000,
        minLength: 0,
        maxLength: 0,
        acceptedFormats: PHOTO_FORMATS,
        allowedValues: [],
        minItems: 1,
        maxItems: 50,
      },
    },
    {
      name: "pieces",
      kind: "ENUM",
      constraints: {
        maxBytes: 0,
        minLength: 0,
        maxLength: 0,
        acceptedFormats: [],
        allowedValues: ROOM_ENUM,
        minItems: 1,
        maxItems: 20,
      },
    },
  ],
  deliverableFormat: "ZIP",
  rcgCriteria: [
    { operator: "FILE_PRESENT", expected: ["archiveRef"] },
    { operator: "ARCHIVE_CONTAINS", expected: ["summary.pdf"] },
    { operator: "FIELDS_PRESENT", expected: ["timestampedPhotos"] },
  ],
};
