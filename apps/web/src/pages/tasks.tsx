import { useEffect } from "react";

import { clearUserId, getUserId, setUserId } from "../auth/auth";
import { LoginForm } from "../components/LoginForm";
import { TaskForm } from "../components/TaskForm";
import { TaskList } from "../components/TaskList";
import { useTasks } from "../hooks/useTasks";

export const TasksPage = () => {
  const { tasks, error, loading, loadTasks, createTask } = useTasks();
  const userId = getUserId();

  useEffect(() => {
    if (userId) {
      void loadTasks();
    }
  }, [userId, loadTasks]);

  const handleLogin = (id: string) => {
    setUserId(id);
    void loadTasks();
  };

  const handleLogout = () => {
    clearUserId();
  };

  if (!userId) {
    return (
      <main>
        <h1>Tasks V5</h1>
        <LoginForm onLogin={handleLogin} />
      </main>
    );
  }

  return (
    <main>
      <h1>Tasks V5</h1>
      <section>
        <p>Connecté: {userId}</p>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </section>
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
