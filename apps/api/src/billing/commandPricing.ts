export function getCommandPrice(
  command: string,
  quotas: Record<string, number>,
): number {
  const quota = quotas[command]

  if (quota === undefined) {
    throw new Error(`COMMAND_NOT_ALLOWED: ${command}`)
  }

  // Pricing simple : 1 unité par commande
  return 1
}
