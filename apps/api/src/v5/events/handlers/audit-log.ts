import type { TaskCreatedEvent, V5Event } from '../types.js';

const isTaskCreated = (event: V5Event): event is TaskCreatedEvent =>
  event.type === 'task.created';

export const handleAuditLog = (event: V5Event): void => {
  if (!isTaskCreated(event)) {
    return;
  }
  console.info('[V5][event]', {
    type: event.type,
    ownerId: event.ownerId,
    taskId: event.taskId,
    occurredAt: event.occurredAt
  });
};
