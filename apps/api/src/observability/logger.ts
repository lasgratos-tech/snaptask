type LogLevel = "info" | "error";

export function log(
  level: LogLevel,
  message: string,
  context: Record<string, unknown>
) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...context,
  };

  // stdout → compatible Railway / Supabase logs
  console.log(JSON.stringify(entry));
}
