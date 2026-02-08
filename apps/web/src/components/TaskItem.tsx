import type { TaskV5 } from "../api/v5";

export const TaskItem = ({ task }: { task: TaskV5 }) => {
  return (
    <li>
      <strong>{task.title}</strong> <span>({task.status})</span>
    </li>
  );
};
