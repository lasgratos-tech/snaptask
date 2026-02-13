import client from 'prom-client';

export const taskExecutionCounter = new client.Counter({
  name: 'snaptask_task_executed_total',
  help: 'Total number of executed SnapTask tasks',
  labelNames: ['taskType'],
});
