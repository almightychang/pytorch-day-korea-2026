import payload from '../data/timeline.json'

export type SourceKey = keyof typeof payload.sources
export type Arm = (typeof payload.arms)[number]
export type RankBins = Record<SourceKey, Uint8Array>
export type Microstep = { rank: number; index: number; fromMs: number; toMs: number; computeShare: number }

const FORWARD = 'DeepSpeedEngine.forward'
const BACKWARD = 'DeepSpeedEngine.backward'
const DEVICE_SOURCES = payload.groups.find((group) => group.key === 'device')!.members as SourceKey[]

export const timeline = payload
export const armByTag = (tag: string) => payload.arms.find((arm) => arm.tag === tag)!

const decode = (encoded: string) => Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))

const withoutLaunchBlockedByNccl = (bins: RankBins): RankBins => ({
  ...bins,
  launch: bins.launch.map((share, bin) => Math.round((share * (255 - bins.nccl[bin])) / 255)),
})

export const decodeRank = (arm: Arm, rank: number) =>
  withoutLaunchBlockedByNccl(
    Object.fromEntries(Object.entries(arm.ranks[rank]).map(([key, text]) => [key, decode(text)])) as RankBins,
  )

const computeShare = (bins: RankBins, fromMs: number, toMs: number) => {
  const first = Math.floor(fromMs / payload.bin_ms)
  const last = Math.ceil(toMs / payload.bin_ms)
  const busy = DEVICE_SOURCES.reduce(
    (sum, source) => sum + bins[source].subarray(first, last).reduce((total, share) => total + share, 0),
    0,
  )
  return busy / 255 / (last - first)
}

export const microsteps = (arm: Arm): Microstep[] =>
  arm.ranks.flatMap((_, rank) => {
    const bins = decodeRank(arm, rank)
    const phases = arm.phases[rank]
    return phases[FORWARD].map(([fromMs], index) => {
      const toMs = phases[BACKWARD][index][1]
      return { rank, index, fromMs, toMs, computeShare: computeShare(bins, fromMs, toMs) }
    })
  })

export const worstMicrostep = (arm: Arm) =>
  microsteps(arm).reduce((worst, step) => (step.computeShare < worst.computeShare ? step : worst))
