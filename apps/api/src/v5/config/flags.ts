const V5_FLAG = process.env.SNAPTASK_V5_ENABLED;

export const isV5Enabled = (): boolean => V5_FLAG === 'true';
