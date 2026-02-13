import { db } from './db.js';
import { randomUUID } from 'crypto';

export async function persistCommandAndEvents(params: {
  commandId: string;
  commandName: string;
  actorId: string;
  payload?: unknown;
  events: Array<{
    aggregateId: string;
    eventType: string;
    payload: unknown;
  }>;
}) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `
      INSERT INTO commands (
        command_id,
        command_name,
        actor_id,
        payload
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        params.commandId,
        params.commandName,
        params.actorId,
        params.payload ?? null
      ]
    );

    for (const event of params.events) {
      await client.query(
        `
        INSERT INTO events (
          event_id,
          command_id,
          aggregate_id,
          event_type,
          event_payload
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          randomUUID(),
          params.commandId,
          event.aggregateId,
          event.eventType,
          event.payload
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
