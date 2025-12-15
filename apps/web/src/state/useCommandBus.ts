import { dispatchCommand } from "@snaptask/core";
import type { TaskCommand } from "@snaptask/core";
import type { ActorRole } from "@snaptask/core";
import { useTaskStore } from "./useTaskStore";

export function useCommandBus(role: ActorRole) {
  const { applyEvent } = useTaskStore();

  function dispatch(command: TaskCommand) {
    const event = dispatchCommand(role, command);
    applyEvent(event);
  }

  return { dispatch };
}
