import type { TaskCommand } from "../domain/TaskCommand.types.js";
import type { ActorRole } from "../rules/permissions.js";
import { canExecute } from "../rules/permissions.js";
import type { TaskEvent } from "../domain/TaskEvent.types.js";
import { log } from "../infra/logger.js";
import { consumeCommand } from "../store/usageStore.js";
import type { BillingPlan } from "../domain/BillingPlan.types.js";

export function dispatchCommand(
  role: ActorRole,
  command: TaskCommand,
  context?: {
    userId: string;
    plan: BillingPlan;
  }
): TaskEvent {
  log("info", "COMMAND_RECEIVED", { role, command, context });

  if (!canExecute(role, command)) {
    log("warn", "COMMAND_REJECTED_PERMISSION", { role, command });
    throw new Error("Permission denied");
  }

  if (context) {
    consumeCommand(context.userId, context.plan);
  }

  const timestamp = new Date().toISOString();
  let event: TaskEvent;

  switch (command.type) {
    case "CreateTask":
      event = {
        taskId: command.payload.id,
        timestamp,
        mutation: {
          type: "rename",
          payload: { title: command.payload.title },
        },
      };
      break;

    case "ChangeStatus":
      event = {
        taskId: command.payload.taskId,
        timestamp,
        mutation: {
          type: "changeStatus",
          payload: { to: command.payload.to },
        },
      };
      break;

    case "ChangePriority":
      event = {
        taskId: command.payload.taskId,
        timestamp,
        mutation: {
          type: "changePriority",
          payload: { to: command.payload.to },
        },
      };
      break;

    case "RenameTask":
      event = {
        taskId: command.payload.taskId,
        timestamp,
        mutation: {
          type: "rename",
          payload: { title: command.payload.title },
        },
      };
      break;

    default:
      log("error", "UNKNOWN_COMMAND", { command });
      throw new Error("Unknown command");
  }

  log("info", "EVENT_EMITTED", event);
  return event;
}
