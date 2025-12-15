import { TaskSchema } from "./task.schema.js";
export function validateTask(input) {
    const result = TaskSchema.safeParse(input);
    if (!result.success) {
        throw new Error("Invalid Task:\n" + JSON.stringify(result.error.format(), null, 2));
    }
    return result.data;
}
