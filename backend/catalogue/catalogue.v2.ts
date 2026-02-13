import type { Catalogue } from "../contracts/catalogue.js";
import {
  AIRBNB_LITE_AVANT_TASK,
  AIRBNB_LITE_APRES_TASK,
} from "../tasks/airbnbLiteTasks.js";
import {
  AIRBNB_LITE_AVANT_TASK_US_RI,
  AIRBNB_LITE_APRES_TASK_US_RI,
} from "../tasks/airbnbLiteTasks.us.reintro.js";

/**
 * CATALOGUE — SnapTask V2 (extrait Airbnb Lite)
 * Références constitutionnelles :
 * - Section 5 : catalogue fini, versionné, auditable
 * - Section 6 : périmètre Airbnb Lite
 */
export const CATALOGUE_V2: Catalogue = {
  version: "v2.1",
  entries: [
    {
      id: "CAT-EDL-AVANT-V2",
      version: "v2.0",
      taskId: AIRBNB_LITE_AVANT_TASK.id,
    },
    {
      id: "CAT-EDL-APRES-V2",
      version: "v2.0",
      taskId: AIRBNB_LITE_APRES_TASK.id,
    },
    {
      id: "CAT-EDL-AVANT-V2-US-RI",
      version: "v2.1",
      taskId: AIRBNB_LITE_AVANT_TASK_US_RI.id,
    },
    {
      id: "CAT-EDL-APRES-V2-US-RI",
      version: "v2.1",
      taskId: AIRBNB_LITE_APRES_TASK_US_RI.id,
    },
  ],
};
