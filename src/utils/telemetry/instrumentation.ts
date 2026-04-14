/**
 * OpenTelemetry instrumentation - TELEMETRY DISABLED
 * No telemetry data is collected or exported.
 */

export function bootstrapTelemetry(): void {}

export function parseExporterTypes(_value: string | undefined): string[] {
  return []
}

export function isTelemetryEnabled(): boolean {
  return false
}

export async function initializeTelemetry(): Promise<unknown> {
  return null
}

export async function flushTelemetry(): Promise<void> {}
