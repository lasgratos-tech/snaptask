import type { Catalogue } from "./contracts/catalogue.js";
import type { TaskContract } from "./contracts/task.js";
import type { Transaction } from "./contracts/transaction.js";
import type { Execution } from "./contracts/execution.js";
import type { RcgValidation } from "./contracts/rcg-validation.js";
import type { Delivery } from "./contracts/delivery.js";
import { InputValidator } from "./services/inputValidator.js";
import type { PaymentGate } from "./services/paymentGate.js";
import type { TaskExecutor } from "./services/taskExecutor.js";
import { RcgValidator } from "./services/rcgValidator.js";
import type { DeliveryService } from "./services/deliveryService.js";
import type { RefundService } from "./services/refundService.js";

/**
 * ORCHESTRATEUR — Flux canonique SnapTask V2
 * Références constitutionnelles :
 * - Section 3 : exécution unique
 * - Section 4 : paiement avant exécution
 * - Section 2 : stateless, déterministe, amnésique
 */
export class SnapTaskPipeline {
  constructor(
    private readonly inputValidator: InputValidator,
    private readonly paymentGate: PaymentGate,
    private readonly taskExecutor: TaskExecutor,
    private readonly rcgValidator: RcgValidator,
    private readonly deliveryService: DeliveryService,
    private readonly refundService: RefundService,
  ) {}

  run(params: {
    catalogue: Catalogue;
    task: TaskContract;
    inputs: Record<string, unknown>;
  }): {
    transaction?: Transaction;
    execution?: Execution;
    rcg?: RcgValidation;
    delivery?: Delivery;
    refunded: boolean;
  } {
    const { catalogue, task, inputs } = params;

    this.assertTaskInCatalogue(catalogue, task);

    // 1) Validation des inputs (AVANT paiement)
    this.inputValidator.validate(task, inputs);

    // 2) Paiement
    const transaction = this.paymentGate.charge(
      task.id,
      task.price.amount,
      task.price.currency,
    );

    // 3) Exécution unique
    const { execution, outputs } = this.taskExecutor.execute(task.id, inputs);

    // 4) Validation RCG™
    const rcg = this.rcgValidator.validate(task, {
      executionId: execution.id,
      ...outputs,
    });

    if (rcg.status === "REFUNDED") {
      // 5) Remboursement automatique
      this.refundService.refund(transaction.id);
      return { transaction, execution, rcg, refunded: true };
    }

    // 5) Livraison
    const delivery = this.deliveryService.deliver(
      execution.id,
      String(outputs.resultRef ?? task.expectedResult),
    );

    return { transaction, execution, rcg, delivery, refunded: false };
  }

  private assertTaskInCatalogue(catalogue: Catalogue, task: TaskContract): void {
    const found = catalogue.entries.some((entry) => entry.taskId === task.id);
    if (!found) {
      throw new Error("TASK_NOT_IN_CATALOGUE");
    }
  }
}
