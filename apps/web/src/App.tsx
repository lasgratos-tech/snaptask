import { useEffect } from "react";
import { Button } from "@snaptask/ui";
import { useTaskStore } from "./state/useTaskStore";
import { useCommandBus } from "./state/useCommandBus";
import type { Task } from "@snaptask/core";

export default function App() {
  const { task, initTask } = useTaskStore();
  const { dispatch } = useCommandBus("user");

  useEffect(() => {
    const initial: Task = {
      id: crypto.randomUUID(),
      title: "Min første oppgave",
      status: "todo",
      priority: "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    initTask(initial);
  }, []);

  if (!task) return null;

  return (
    <div style={{ padding: 24 }}>
      <h1>SnapTask – Norge</h1>

      <p><strong>Tittel:</strong> {task.title}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Priorité:</strong> {task.priority}</p>

      <Button
        label="Passer à DOING"
        onClick={() =>
          dispatch({
            type: "ChangeStatus",
            payload: { taskId: task.id, to: "doing" },
          })
        }
      />

      <Button
        label="Priorité HIGH"
        onClick={() =>
          dispatch({
            type: "ChangePriority",
            payload: { taskId: task.id, to: "high" },
          })
        }
      />
    </div>
  );
}
