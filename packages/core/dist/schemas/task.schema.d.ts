import { z } from "zod";
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<{
        todo: "todo";
        doing: "doing";
        done: "done";
    }>;
    priority: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
    dueDate: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TaskInput = z.infer<typeof TaskSchema>;
