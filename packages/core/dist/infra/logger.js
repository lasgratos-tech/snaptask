/**
 * Logger central
 * Accepte n’importe quelle donnée sérialisable
 */
export function log(level, message, meta) {
    const entry = {
        level,
        message,
        meta,
        timestamp: new Date().toISOString(),
    };
    // Aujourd’hui console, demain Sentry / OTEL / Datadog
    console[level](JSON.stringify(entry));
}
