import type { TaskContract } from "../contracts/task.js";

/**
 * TASKS — Airbnb Lite (preuves ponctuelles)
 * Références constitutionnelles :
 * - Section 6.2 : documents et preuves autorisés
 * - Section 6.3 : états des lieux par photos horodatées
 * - Section 6.4 : interdictions Airbnb (pas de logique avancée)
 * - Section 2 : stateless, déterministe, amnésique
 */
const PHOTO_FORMATS = ["image/jpeg", "image/png"] as const;
const ROOM_ENUM = [
  "ENTREE",
  "SALON",
  "CHAMBRE",
  "CUISINE",
  "SALLE_DE_BAIN",
] as const;

export const AIRBNB_LITE_AVANT_TASK: TaskContract = {
  id: "SNAPTASK-TASK-EDL-AVANT-V2",
  version: "v2.0",
  category: "PROOF",
  price: { amount: 0, currency: "EUR" },
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

export const AIRBNB_LITE_APRES_TASK: TaskContract = {
  id: "SNAPTASK-TASK-EDL-APRES-V2",
  version: "v2.0",
  category: "PROOF",
  price: { amount: 0, currency: "EUR" },
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
