import { useEffect } from "react";

import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { useTasks } from "../hooks/useTasks";

export const TasksPage = () => {
  const { tasks, error, loading, loadTasks, createTask } = useTasks();

  useEffect(() => {
    void loadTasks();
  }, []);

  return (
    <main>
      <h1>Tasks V5</h1>
      <section>
        <TaskForm onCreate={createTask} />
      </section>
      <section>
        {loading ? <p>Chargement en cours...</p> : null}
        {error ? <p>Erreur: {error}</p> : null}
        {!loading && !error ? <TaskList tasks={tasks} /> : null}
      </section>
    </main>
  );
};
