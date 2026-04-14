/**
 * First-party event logging - TELEMETRY DISABLED
 * All event logging to Anthropic's backend is stubbed to no-ops.
 */

export function shouldSampleEvent(_eventName: string): number | null {
  return 0 // 0 = do not log
}

export async function shutdown1PEventLogging(): Promise<void> {}

export function is1PEventLoggingEnabled(): boolean {
  return false
}

export function logEventTo1P(
  _eventName: string,
  _metadata: Record<string, unknown>,
): void {}

export function logGrowthBookExperimentTo1P(_data: unknown): void {}

export function initialize1PEventLogging(): void {}

export async function reinitialize1PEventLoggingIfConfigChanged(): Promise<void> {}
