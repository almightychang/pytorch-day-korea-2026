import { type Arm, decodeRank, microsteps, timeline } from './timeline'

export type Interval = { fromMs: number; toMs: number }
export type RankWindow = Interval & { rank: number; forwardEndMs: number; waits: Interval[]; waitMs: number }

const FULL_SHARE = 255
const BUSY_SHARE = FULL_SHARE / 2
const MERGE_GAP_MS = 4
const MIN_WAIT_MS = 4

const busyIntervals = (shares: Uint8Array, { fromMs, toMs }: Interval): Interval[] => {
  const binMs = timeline.bin_ms
  const runs: Interval[] = []
  for (let bin = Math.floor(fromMs / binMs); bin < Math.ceil(toMs / binMs); bin++) {
    if (shares[bin] < BUSY_SHARE) continue
    const last = runs.at(-1)
    if (last && bin * binMs - last.toMs <= MERGE_GAP_MS) last.toMs = (bin + 1) * binMs
    else runs.push({ fromMs: bin * binMs, toMs: (bin + 1) * binMs })
  }
  return runs.filter((run) => run.toMs - run.fromMs >= MIN_WAIT_MS)
}

const busyMs = (shares: Uint8Array, { fromMs, toMs }: Interval) => {
  const binMs = timeline.bin_ms
  const window = shares.subarray(Math.floor(fromMs / binMs), Math.ceil(toMs / binMs))
  return (window.reduce((sum, share) => sum + share, 0) / FULL_SHARE) * binMs
}

const forwardEndSpread = (windows: RankWindow[]) => {
  const ends = windows.map((window) => window.forwardEndMs)
  return Math.max(...ends) - Math.min(...ends)
}

export const mostSkewedMicrostep = (arm: Arm): RankWindow[] => {
  const byIndex = new Map<number, RankWindow[]>()
  for (const step of microsteps(arm)) {
    const nccl = decodeRank(arm, step.rank).nccl
    const window = { ...step, waits: busyIntervals(nccl, step), waitMs: busyMs(nccl, step) }
    byIndex.set(step.index, [...(byIndex.get(step.index) ?? []), window])
  }
  return [...byIndex.values()].reduce((most, windows) =>
    forwardEndSpread(windows) > forwardEndSpread(most) ? windows : most,
  )
}
