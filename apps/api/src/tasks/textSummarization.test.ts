import { describe, it, expect } from "vitest";
import { bootstrapDev } from "../helpers/bootstrap.js";
import { apiPost } from "../helpers/apiClient.js";
import {
  countLedgerEntries,
  countTaskExecutions,
  findCompensation,
} from "../helpers/db.js";

describe("TEXT_SUMMARIZATION — non regression", async () => {
  const { apiKey } = await bootstrapDev();

  const payload = {
    taskCode: "TEXT_SUMMARIZATION",
    idempotencyKey: "test-idem-001",
    input: {
      text: "This is a long text used to validate deterministic summarization behavior in SnapTask.",
    },
  };

  it("executes only once for same idempotencyKey", async () => {
    const r1 = await apiPost("/v1/tasks/execute", payload, apiKey);
    const r2 = await apiPost("/v1/tasks/execute", payload, apiKey);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);

    expect(await countTaskExecutions(payload.idempotencyKey)).toBe(1);
    expect(await countLedgerEntries(payload.idempotencyKey)).toBe(1);
  });

  it("does not double debit on retry", async () => {
    const debitCount = await countLedgerEntries(payload.idempotencyKey);
    expect(debitCount).toBe(1);
  });

  it("creates compensation on failure", async () => {
    const failingPayload = {
      ...payload,
      idempotencyKey: "test-idem-failure",
      input: {
        text: "x", // invalide → forcer échec
      },
    };

    const res = await apiPost("/v1/tasks/execute", failingPayload, apiKey);
    expect(res.status).toBeGreaterThanOrEqual(400);

    const compensation = await findCompensation(
      failingPayload.idempotencyKey
    );

    expect(compensation).not.toBeNull();
  });
});
