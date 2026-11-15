import type { Scene } from './codeLanes'
import { laneColour } from './laneColours'
import { solid, waiting, type LegendItem, type Row } from './lanes'

type Activity = Pick<Scene, 'host' | 'kernels' | 'copies'>

const isWaiting = (span: Activity['host'][number]) => span.state === 'wait'

export const sceneRows = ({ host, kernels, copies }: Activity): Row[] => [
  { name: 'host', bars: host.map((span) => (isWaiting(span) ? waiting(span) : solid(span, laneColour.python))) },
  { name: 'device', bars: kernels.map((span) => solid(span, laneColour.kernel)) },
  ...(copies.length ? [{ name: 'copy', bars: copies.map((span) => solid(span, laneColour[span.kind])) }] : []),
]

export const sceneLegend = ({ host, copies }: Activity): LegendItem[] => [
  { label: 'python', fill: laneColour.python },
  ...(host.some(isWaiting) ? [{ label: 'waiting for the GPU' }] : []),
  { label: 'kernel', fill: laneColour.kernel },
  ...[...new Set(copies.map((copy) => copy.kind))].map((kind) => ({ label: kind, fill: laneColour[kind] })),
]
