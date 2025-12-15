import type { TaskCommand } from "../domain/TaskCommand.types.js";

export type ActorRole = "guest" | "user" | "admin";

export function canExecute(
  role: ActorRole,
  command: TaskCommand
): boolean {
  switch (command.type) {
    case "CreateTask":
      return role !== "guest";

    case "ChangeStatus":
    case "ChangePriority":
    case "RenameTask":
      return role === "user" || role === "admin";

    default:
      return false;
  }
}
