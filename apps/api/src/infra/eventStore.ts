import { randomUUID } from 'crypto';
import { db } from './db.js';

export type StoredEvent = {
  eventId: string;
  commandId: string;
  aggregateId: string;
  eventType: string;
  payload: unknown;
};

export async function appendEvent(
  commandId: string,
  aggregateId: string,
  eventType: string,
  payload: unknown
) {
  const eventId = randomUUID();

  await db.query(
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
    [eventId, commandId, aggregateId, eventType, payload]
  );

  return eventId;
}

export async function loadEvents(aggregateId: string) {
  const { rows } = await db.query(
    `
    SELECT *
    FROM events
    WHERE aggregate_id = $1
    ORDER BY created_at ASC
    `,
    [aggregateId]
  );

  return rows;
}
