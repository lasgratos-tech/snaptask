import { canExecute } from "../rules/permissions.js";
import { log } from "../infra/logger.js";
import { consumeCommand } from "../store/usageStore.js";
export function dispatchCommand(role, command, context) {
    log("info", "COMMAND_RECEIVED", { role, command, context });
    if (!canExecute(role, command)) {
        log("warn", "COMMAND_REJECTED_PERMISSION", { role, command });
        throw new Error("Permission denied");
    }
    if (context) {
        consumeCommand(context.userId, context.plan);
    }
    const timestamp = new Date().toISOString();
    let event;
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
