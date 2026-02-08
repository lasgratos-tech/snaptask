export type TaskCreatedEvent = {
  type: 'task.created';
  taskId: string;
  ownerId: string;
  occurredAt: string;
};

export type V5Event = TaskCreatedEvent;
