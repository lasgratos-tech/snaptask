import { useEffect, useState } from "react";

import { createTask, getTasks, type TaskV5 } from "../api/v5";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";

export const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskV5[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const handleCreate = async (title: string) => {
    setError(null);
    await createTask(title);
    await loadTasks();
  };

  return (
    <main>
      <h1>Tasks V5</h1>
      <section>
        <TaskForm onCreate={handleCreate} />
      </section>
      <section>
        {isLoading ? <p>Chargement en cours...</p> : null}
        {error ? <p>Erreur: {error}</p> : null}
        {!isLoading && !error ? <TaskList tasks={tasks} /> : null}
      </section>
    </main>
  );
};
