/**
 * Datadog analytics - TELEMETRY DISABLED
 * All tracking is stubbed to no-ops.
 */

export async function initializeDatadog(): Promise<boolean> {
  return false
}

export async function shutdownDatadog(): Promise<void> {}

export async function trackDatadogEvent(
  _eventName: string,
  _properties: { [key: string]: boolean | number | undefined },
): Promise<void> {}
