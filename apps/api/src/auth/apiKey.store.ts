import { generateApiKey } from './apiKey.generator';

export interface ApiKeyRecord {
  key: string;
  owner: string;
  active: boolean;
  createdAt: number;
}

const API_KEYS: ApiKeyRecord[] = [
  {
    key: 'dev-snaptask-key',
    owner: 'local-dev',
    active: true,
    createdAt: Date.now(),
  },
];

export function findApiKey(key: string): ApiKeyRecord | null {
  const record = API_KEYS.find(
    (k) => k.key === key && k.active === true
  );
  return record ?? null;
}

export function listApiKeys(owner?: string): ApiKeyRecord[] {
  return owner
    ? API_KEYS.filter((k) => k.owner === owner)
    : API_KEYS;
}

export function createApiKey(owner: string): ApiKeyRecord {
  const record: ApiKeyRecord = {
    key: generateApiKey(),
    owner,
    active: true,
    createdAt: Date.now(),
  };
  API_KEYS.push(record);
  return record;
}

export function revokeApiKey(key: string): boolean {
  const record = API_KEYS.find((k) => k.key === key);
  if (!record) return false;
  record.active = false;
  return true;
}
