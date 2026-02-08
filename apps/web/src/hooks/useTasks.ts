import { useCallback, useState } from "react";

import { createTask as createTaskApi, getTasks } from "../api/v5";
import type { TaskV5 } from "../api/v5";

export const useTasks = () => {
  const [tasks, setTasks] = useState<TaskV5[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (title: string) => {
      setLoading(true);
      setError(null);
      try {
        await createTaskApi(title);
        await loadTasks();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [loadTasks],
  );

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
  };
};
