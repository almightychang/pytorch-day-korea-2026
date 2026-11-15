import { type Arm, decodeRank, type Microstep, microsteps, type SourceKey, timeline } from './timeline'

const FULL = 255
const COMPUTE_SOURCES = timeline.groups.find((group) => group.key === 'device')!.members as SourceKey[]

type Window = { rank: number; fromMs: number; toMs: number }

const sum = (values: ArrayLike<number>, from = 0, to = values.length) => {
  let total = 0
  for (let index = from; index < to; index++) total += values[index]
  return total
}

export const deviceShare = (arm: Arm) => {
  const ranks = arm.ranks.map((_, rank) => {
    const bins = decodeRank(arm, rank)
    const compute = Array.from(bins.nccl, (_, bin) =>
      Math.min(FULL, COMPUTE_SOURCES.reduce((total, source) => total + bins[source][bin], 0)),
    )
    return { compute, anyKernel: compute.map((share, bin) => Math.max(share, bins.nccl[bin])) }
  })
  const pooled = (kind: 'compute' | 'anyKernel', windows: Window[]) => {
    const spans = windows.map(({ rank, fromMs, toMs }) => ({
      shares: ranks[rank][kind],
      from: Math.floor(fromMs / timeline.bin_ms),
      to: Math.ceil(toMs / timeline.bin_ms),
    }))
    const busy = spans.reduce((total, span) => total + sum(span.shares, span.from, span.to), 0)
    return busy / FULL / spans.reduce((total, span) => total + span.to - span.from, 0)
  }
  const wholeStep = arm.ranks.map((_, rank) => ({ rank, fromMs: 0, toMs: arm.wall_ms }))
  const phase = (span: (step: Microstep) => [number, number]) =>
    microsteps(arm).map((step) => ({ rank: step.rank, fromMs: span(step)[0], toMs: span(step)[1] }))

  return {
    anyKernel: pooled('anyKernel', wholeStep),
    compute: pooled('compute', wholeStep),
    forward: pooled('compute', phase((step) => [step.fromMs, step.forwardEndMs])),
    backward: pooled('compute', phase((step) => [step.forwardEndMs, step.toMs])),
  }
}
