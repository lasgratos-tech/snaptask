import type { RcgValidation } from "../contracts/rcg-validation.js";
import type { TaskContract } from "../contracts/task.js";

/**
 * SERVICE — RcgValidator
 * Références constitutionnelles :
 * - Section 2 : RCG™ livré ou remboursé
 * - Section 4 : validation avant livraison
 */
export class RcgValidator {
  validate(task: TaskContract, outputs: Record<string, unknown>): RcgValidation {
    for (const criterion of task.rcgCriteria) {
      const result = this.evaluateCriterion(criterion, outputs);
      if (!result) {
        return { executionId: String(outputs.executionId ?? ""), status: "REFUNDED" };
      }
    }
    return { executionId: String(outputs.executionId ?? ""), status: "DELIVERED" };
  }

  private evaluateCriterion(
    criterion: TaskContract["rcgCriteria"][number],
    outputs: Record<string, unknown>,
  ): boolean {
    switch (criterion.operator) {
      case "FILE_PRESENT": {
        return criterion.expected.every((key) => Boolean(outputs[key]));
      }
      case "FORMAT_MATCH": {
        return criterion.expected.every((fmt) => outputs.format === fmt);
      }
      case "SECTION_COUNT": {
        const count = Number(outputs.sectionCount ?? 0);
        return criterion.expected.some((v) => count === Number(v));
      }
      case "FIELDS_PRESENT": {
        return criterion.expected.every((key) => key in outputs);
      }
      case "ARCHIVE_CONTAINS": {
        const items = Array.isArray(outputs.archiveItems)
          ? (outputs.archiveItems as string[])
          : [];
        return criterion.expected.every((item) => items.includes(item));
      }
      default:
        return false;
    }
  }
}
