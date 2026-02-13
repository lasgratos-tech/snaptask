import type { TaskContract, TaskInputSpec, InputKind } from "../contracts/task.js";

/**
 * SERVICE — InputValidator
 * Références constitutionnelles :
 * - Section 3 : définition d’une task, entrées bornées, pas de paramétrage libre
 * - Section 4 : validation des inputs AVANT paiement
 */
export class InputValidator {
  validate(task: TaskContract, inputs: Record<string, unknown>): void {
    for (const spec of task.inputs) {
      const value = inputs[spec.name];
      this.validateInput(spec, value);
    }
  }

  private validateInput(spec: TaskInputSpec, value: unknown): void {
    if (spec.kind === "TEXT") {
      this.validateText(spec, value);
      return;
    }
    if (spec.kind === "FILE") {
      this.validateFile(spec, value);
      return;
    }
    if (spec.kind === "ENUM") {
      this.validateEnum(spec, value);
    }
  }

  private validateText(spec: TaskInputSpec, value: unknown): void {
    if (typeof value !== "string") {
      throw new Error("INPUT_INVALID_TYPE");
    }
    const length = value.length;
    if (length < spec.constraints.minLength || length > spec.constraints.maxLength) {
      throw new Error("INPUT_TEXT_BOUNDS");
    }
  }

  private validateFile(spec: TaskInputSpec, value: unknown): void {
    const files = Array.isArray(value) ? value : [value];
    if (
      files.length < spec.constraints.minItems ||
      files.length > spec.constraints.maxItems
    ) {
      throw new Error("INPUT_FILE_COUNT");
    }
    for (const file of files) {
      if (
        !file ||
        typeof file !== "object" ||
        !("bytes" in file) ||
        !("format" in file)
      ) {
        throw new Error("INPUT_INVALID_FILE");
      }
      const bytes = Number((file as { bytes: number }).bytes);
      const format = String((file as { format: string }).format);
      if (bytes > spec.constraints.maxBytes) {
        throw new Error("INPUT_FILE_TOO_LARGE");
      }
      if (!spec.constraints.acceptedFormats.includes(format)) {
        throw new Error("INPUT_FILE_FORMAT");
      }
    }
  }

  private validateEnum(spec: TaskInputSpec, value: unknown): void {
    const values = Array.isArray(value) ? value : [value];
    if (
      values.length < spec.constraints.minItems ||
      values.length > spec.constraints.maxItems
    ) {
      throw new Error("INPUT_ENUM_COUNT");
    }
    for (const item of values) {
      if (typeof item !== "string") {
        throw new Error("INPUT_INVALID_ENUM");
      }
      if (!spec.constraints.allowedValues.includes(item)) {
        throw new Error("INPUT_ENUM_VALUE");
      }
    }
  }
}
