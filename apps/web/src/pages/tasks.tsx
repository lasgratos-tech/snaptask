import { useEffect, useState } from "react";

import { createTask, getTasks, type TaskV5 } from "../api/v5";

export const TasksPage = () => {
  const [tasks, setTasks] = useState<TaskV5[]>([]);
  const [title, setTitle] = useState("");
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await createTask(title.trim());
      setTitle("");
      await loadTasks();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Tasks V5</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <button type="submit" disabled={isLoading}>
          Create
        </button>
      </form>
      {error ? <p>Error: {error}</p> : null}
      {isLoading ? <p>Loading...</p> : null}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} — {task.status}
          </li>
        ))}
      </ul>
    </main>
  );
};
