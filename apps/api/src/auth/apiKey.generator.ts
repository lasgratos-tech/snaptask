import crypto from 'node:crypto';

export function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(24).toString('hex');
}
