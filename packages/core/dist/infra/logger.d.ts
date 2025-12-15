export type LogLevel = "info" | "warn" | "error";
/**
 * Logger central
 * Accepte n’importe quelle donnée sérialisable
 */
export declare function log(level: LogLevel, message: string, meta?: unknown): void;
