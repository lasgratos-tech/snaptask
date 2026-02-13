import { InputValidator } from "../services/inputValidator.js";
import { RcgValidator } from "../services/rcgValidator.js";
import { SnapTaskPipeline } from "../orchestrator.js";
import type { PaymentGate } from "../services/paymentGate.js";
import type { TaskExecutor } from "../services/taskExecutor.js";
import type { DeliveryService } from "../services/deliveryService.js";
import type { RefundService } from "../services/refundService.js";
import type { Catalogue } from "../contracts/catalogue.js";
import type { TaskContract } from "../contracts/task.js";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function createPipeline(spy: {
  paid: string[];
  executed: string[];
  delivered: string[];
  refunded: string[];
}) {
  const paymentGate: PaymentGate = {
    charge(taskId, amount, currency) {
      spy.paid.push(taskId);
      return { id: "tx-1", taskId, paidAt: "now" };
    },
  };

  const executor: TaskExecutor = {
    execute(taskId) {
      spy.executed.push(taskId);
      return {
        execution: { id: "exec-1", transactionId: "tx-1" },
        outputs: { resultRef: "result" },
      };
    },
  };

  const delivery: DeliveryService = {
    deliver(executionId) {
      spy.delivered.push(executionId);
      return { id: "deliv-1", executionId, resultRef: "result" };
    },
  };

  const refund: RefundService = {
    refund(transactionId) {
      spy.refunded.push(transactionId);
    },
  };

  return new SnapTaskPipeline(
    new InputValidator(),
    paymentGate,
    executor,
    new RcgValidator(),
    delivery,
    refund,
  );
}

const catalogue: Catalogue = {
  version: "v1",
  entries: [{ id: "entry-1", version: "v1", taskId: "TASK-1" }],
};

const task: TaskContract = {
  id: "TASK-1",
  version: "v1",
  category: "DOCUMENT",
  price: { amount: 10, currency: "EUR" },
  expectedResult: "RESULT",
  inputs: [
    {
      name: "text",
      kind: "TEXT",
      constraints: {
        maxBytes: 1000,
        minLength: 1,
        maxLength: 10,
        acceptedFormats: [],
        allowedValues: [],
        minItems: 1,
        maxItems: 1,
      },
    },
  ],
  deliverableFormat: "PDF",
  rcgCriteria: [{ operator: "FIELDS_PRESENT", expected: ["resultRef"] }],
};

// Test 1: paiement avant exécution
{
  const spy = { paid: [], executed: [], delivered: [], refunded: [] };
  const pipeline = createPipeline(spy);
  pipeline.run({ catalogue, task, inputs: { text: "ok" } });
  assert(spy.paid.length === 1, "PAYMENT_NOT_CALLED");
  assert(spy.executed.length === 1, "EXECUTION_NOT_CALLED");
}

// Test 2: exécution unique
{
  const spy = { paid: [], executed: [], delivered: [], refunded: [] };
  const pipeline = createPipeline(spy);
  pipeline.run({ catalogue, task, inputs: { text: "ok" } });
  assert(spy.executed.length === 1, "EXECUTION_NOT_UNIQUE");
}

// Test 3: RCG™ binaire
{
  const spy = { paid: [], executed: [], delivered: [], refunded: [] };
  const pipeline = createPipeline(spy);
  const result = pipeline.run({ catalogue, task, inputs: { text: "ok" } });
  assert(result.rcg?.status === "DELIVERED", "RCG_NOT_BINARY");
}

// Test 4: remboursement automatique si échec RCG™
{
  const spy = { paid: [], executed: [], delivered: [], refunded: [] };
  const failingTask: TaskContract = {
    ...task,
    rcgCriteria: [{ operator: "FIELDS_PRESENT", expected: ["missing"] }],
  };
  const pipeline = createPipeline(spy);
  const result = pipeline.run({
    catalogue,
    task: failingTask,
    inputs: { text: "ok" },
  });
  assert(result.refunded === true, "REFUND_NOT_TRIGGERED");
  assert(spy.refunded.length === 1, "REFUND_NOT_CALLED");
}

// Test 5: aucune exécution si inputs invalides
{
  const spy = { paid: [], executed: [], delivered: [], refunded: [] };
  const pipeline = createPipeline(spy);
  let failed = false;
  try {
    pipeline.run({ catalogue, task, inputs: { text: "" } });
  } catch {
    failed = true;
  }
  assert(failed === true, "INVALID_INPUT_NOT_REJECTED");
  assert(spy.paid.length === 0, "PAYMENT_CALLED_ON_INVALID_INPUT");
  assert(spy.executed.length === 0, "EXECUTION_CALLED_ON_INVALID_INPUT");
}
