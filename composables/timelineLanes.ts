import { type Arm, type RankBins, type SourceKey, timeline } from './timeline'

export type LaneGroup = { key: string; label: string; members: SourceKey[] }
export type LanePaint = { sources: SourceKey[]; colour?: string }
type RGB = [number, number, number]

const GROUP_ORDER = ['host', 'device', 'copy', 'nccl']
const HIDDEN_SOURCES = ['sync', 'd2d']
const RECOLOUR: Partial<Record<SourceKey, string>> = { launch: '#3fc4b4' }

export const TRACK: RGB = [26, 32, 40]
export const GROUP_COLOUR: Record<string, { label: string; color: string }> = {
  device: { label: 'compute', color: timeline.sources.gemm.color },
  copy: { label: 'copy', color: timeline.sources.d2h.color },
}
export const laneGroups: LaneGroup[] = GROUP_ORDER.map((key) => timeline.groups.find((g) => g.key === key) as LaneGroup).map(
  (group) => ({ ...group, members: group.members.filter((member) => !HIDDEN_SOURCES.includes(member)) }),
)
export const sourceColour = (key: SourceKey) => RECOLOUR[key] ?? timeline.sources[key].color
export const groupChips = (group: LaneGroup) =>
  GROUP_COLOUR[group.key]
    ? [GROUP_COLOUR[group.key]]
    : group.members.map((key) => ({ label: timeline.sources[key].label, color: sourceColour(key) }))
export const groupLane = (group: LaneGroup) => ({
  group: group.key,
  label: group.label,
  sources: group.members,
  colour: GROUP_COLOUR[group.key]?.color,
})

const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB

const columnPaint = (bins: RankBins, lane: LanePaint, firstBin: number, lastBin: number) => {
  let total = 0
  let leader = lane.sources[0]
  let leaderValue = -1
  for (const key of lane.sources) {
    const shares = bins[key].subarray(firstBin, lastBin)
    const value =
      timeline.sources[key].kind === 'count'
        ? Math.max(...shares)
        : shares.reduce((sum, share) => sum + share, 0) / shares.length
    total += value
    if (value > leaderValue) {
      leaderValue = value
      leader = key
    }
  }
  const share = Math.min(255, total) / 255
  const standsAlone = lane.sources.length === 1 && timeline.sources[leader].kind === 'share'
  return { colour: rgb(lane.colour ?? sourceColour(leader)), alpha: standsAlone ? Math.sqrt(share) : share }
}

export const renderLaneLayer = (
  arm: Arm,
  lane: LanePaint,
  rankBins: RankBins[],
  span: { fromMs: number; toMs: number },
  columns: number,
  laneRows: number,
) => {
  const surface = document.createElement('canvas')
  surface.width = columns
  surface.height = rankBins.length * laneRows
  const ctx = surface.getContext('2d')!
  const image = ctx.createImageData(columns, surface.height)
  const firstWindowBin = span.fromMs / timeline.bin_ms
  const binsPerColumn = (span.toMs - span.fromMs) / timeline.bin_ms / columns

  for (let x = 0; x < columns; x++) {
    const firstBin = Math.floor(firstWindowBin + x * binsPerColumn)
    const lastBin = Math.min(arm.bins, Math.max(firstBin + 1, Math.ceil(firstWindowBin + (x + 1) * binsPerColumn)))
    rankBins.forEach((bins, row) => {
      const { colour, alpha } = columnPaint(bins, lane, firstBin, lastBin)
      for (let y = row * laneRows; y < (row + 1) * laneRows; y++) {
        const at = (y * columns + x) * 4
        for (let channel = 0; channel < 3; channel++)
          image.data[at + channel] = Math.round(TRACK[channel] + (colour[channel] - TRACK[channel]) * alpha)
        image.data[at + 3] = 255
      }
    })
  }
  ctx.putImageData(image, 0, 0)
  return surface
}
