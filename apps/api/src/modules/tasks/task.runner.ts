

export async function executeTask(
  type: string,
  input: { prompt: string }
) {
  // Mock IA volontaire
  return {
    result: `Generated ${type} for prompt: "${input.prompt}"`,
  };
}
