import type { TaskCommand } from "../domain/TaskCommand.types.js";
import type { ActorRole } from "../rules/permissions.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
import type { BillingPlan } from "../domain/BillingPlan.types.js";
export declare function dispatchCommand(role: ActorRole, command: TaskCommand, context?: {
    userId: string;
    plan: BillingPlan;
}): TaskEvent;
