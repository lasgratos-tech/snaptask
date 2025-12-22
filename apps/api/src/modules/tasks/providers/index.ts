import { TaskProvider } from './provider.interface';
import { MockProvider } from './mock.provider';

const providers: Record<string, TaskProvider> = {
  mock: MockProvider,
};

/**
 * Sélection du provider actif
 * (plus tard: env, feature flag, pays, coût)
 */
export function getActiveProvider(): TaskProvider {
  return providers.mock;
}
