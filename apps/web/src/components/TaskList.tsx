import type { TaskV5 } from "../api/v5";
import { TaskItem } from "./TaskItem";

type TaskListProps = {
  tasks: TaskV5[];
};

export const TaskList = ({ tasks }: TaskListProps) => {
  if (tasks.length === 0) {
    return <p>Aucune task pour le moment.</p>;
  }

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );
};
