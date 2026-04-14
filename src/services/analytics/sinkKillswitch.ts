export type SinkName = 'datadog' | 'firstParty'

export function isSinkKilled(_sink: SinkName): boolean {
  return true // always killed — telemetry disabled
}
