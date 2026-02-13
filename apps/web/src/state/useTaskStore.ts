import { useState } from "react";
import type { Task, TaskEvent } from "@snaptask/core";
import { replayTask } from "@snaptask/core";

export function useTaskStore() {
  const [task, setTask] = useState<Task | null>(null);
  const [events, setEvents] = useState<TaskEvent[]>([]);

  function applyEvent(event: TaskEvent) {
    setEvents(prev => {
      const next = [...prev, event];

      if (!task) return next;

      const rebuilt = replayTask(task, [event]);
      setTask(rebuilt);

      return next;
    });
  }

  function initTask(initial: Task) {
    setTask(initial);
    setEvents([]);
  }

  return {
    task,
    events,
    applyEvent,
    initTask,
  };
}
