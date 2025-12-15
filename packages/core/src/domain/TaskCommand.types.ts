import type { TaskPriority, TaskStatus } from "./Task.types.js";

export type TaskCommand =
  | {
      type: "CreateTask";
      payload: {
        id: string;
        title: string;
        priority: TaskPriority;
      };
    }
  | {
      type: "ChangeStatus";
      payload: {
        taskId: string;
        to: TaskStatus;
      };
    }
  | {
      type: "ChangePriority";
      payload: {
        taskId: string;
        to: TaskPriority;
      };
    }
  | {
      type: "RenameTask";
      payload: {
        taskId: string;
        title: string;
      };
    };
