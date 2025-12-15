import type { TaskCommand } from "../domain/TaskCommand.types.js";
export type ActorRole = "guest" | "user" | "admin";
export declare function canExecute(role: ActorRole, command: TaskCommand): boolean;
