<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { armByTag, decodeRank, type RankBins, type SourceKey, timeline } from '../composables/timeline'

const props = withDefaults(
  defineProps<{
    arm?: string
    ranks?: number[]
    fromMs?: number
    toMs?: number
    laneHeight?: number
    sublanes?: string[]
  }>(),
  { arm: 'base', laneHeight: 14, sublanes: () => [] },
)

type Group = { key: string; label: string; members: SourceKey[] }
type Lane = { group: string; label: string; sources: SourceKey[]; colour?: string; top: number }
type RGB = [number, number, number]

const GROUP_ORDER = ['host', 'device', 'copy', 'nccl']
const HIDDEN_SOURCES = ['sync']
const groups = GROUP_ORDER.map((key) => timeline.groups.find((g) => g.key === key) as Group).map((group) => ({
  ...group,
  members: group.members.filter((member) => !HIDDEN_SOURCES.includes(member)),
}))
const RECOLOUR: Partial<Record<SourceKey, string>> = { launch: '#3fc4b4' }
const sourceColour = (key: SourceKey) => RECOLOUR[key] ?? timeline.sources[key].color
const GROUP_COLOUR: Record<string, { label: string; color: string }> = {
  device: { label: 'compute', color: timeline.sources.gemm.color },
  copy: { label: 'copy', color: timeline.sources.d2h.color },
}

const WIDTH = 1600
const PHASE_HEIGHT = 24
const PHASE_GAP = 8
const RULER_HEIGHT = 32
const RENDER_SCALE = 3
const TICK_STEPS_MS = [10, 25, 50, 100, 250, 500, 1000]
const MIN_TICK_PX = 110
const FADE_MS = 900
const FIRST_GROUP = 'device'
const OTHERS_DELAY_MS = 2000
const TRACK: RGB = [26, 32, 40]
const SUBLANE_LABEL_GAP = 16

const arm = armByTag(props.arm)
const ranks = props.ranks ?? arm.ranks.map((_, rank) => rank)
const showsRankNames = ranks.length > 1
const laneHeight = props.laneHeight
const sublaneGap = Math.max(2, Math.round(laneHeight * 0.1))
const hasSublanes = props.sublanes.length > 0
const groupGap = hasSublanes ? Math.round(laneHeight * 0.5) : Math.round(laneHeight * 0.2)

const groupLanes = (group: Group): Omit<Lane, 'top'>[] =>
  props.sublanes.includes(group.key)
    ? group.members.map((source) => ({
        group: group.key,
        label: timeline.sources[source].label,
        sources: [source],
        colour: sourceColour(source),
      }))
    : [{ group: group.key, label: group.label, sources: group.members, colour: GROUP_COLOUR[group.key]?.color }]

const lanes: Lane[] = []
let nextTop = 0
for (const group of groups) {
  for (const lane of groupLanes(group)) {
    lanes.push({ ...lane, top: nextTop })
    nextTop += laneHeight + sublaneGap
  }
  nextTop += groupGap - sublaneGap
}
const rankBlock = nextTop - groupGap
const rankPitch = rankBlock + Math.round(laneHeight * 1.2)

const LABEL_WIDTH = hasSublanes ? 200 : 96
const PLOT_WIDTH = WIDTH - LABEL_WIDTH
const fromMs = props.fromMs ?? 0
const toMs = props.toMs ?? Math.max(...timeline.arms.map((a) => a.wall_ms))
const endMs = Math.min(toMs, arm.wall_ms)
const pxPerMs = PLOT_WIDTH / (toMs - fromMs)
const plotPx = (endMs - fromMs) * pxPerMs
const tickMs = TICK_STEPS_MS.find((step) => step * pxPerMs >= MIN_TICK_PX) ?? TICK_STEPS_MS.at(-1)!

const lanesTop = PHASE_HEIGHT + PHASE_GAP
const lanesHeight = (ranks.length - 1) * rankPitch + rankBlock
const height = lanesTop + lanesHeight + RULER_HEIGHT
const laneTop = (row: number, lane: Lane) => lanesTop + row * rankPitch + lane.top
const xAt = (ms: number) => LABEL_WIDTH + (ms - fromMs) * pxPerMs

const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB

const chips = (group: Group) =>
  GROUP_COLOUR[group.key]
    ? [GROUP_COLOUR[group.key]]
    : group.members.map((key) => ({ label: timeline.sources[key].label, color: sourceColour(key) }))

const canvas = ref<HTMLCanvasElement>()
const isActive = useIsSlideActive()
const othersShown = ref(false)
let layers: HTMLCanvasElement[] = []
let frame = 0
let startedAt = 0
let elapsedMs = 0

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const columnPaint = (bins: RankBins, lane: Lane, firstBin: number, lastBin: number) => {
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
  return { colour: rgb(lane.colour ?? sourceColour(leader)), alpha: Math.min(255, total) / 255 }
}

const renderLayer = (lane: Lane, rankBins: RankBins[]) => {
  const columns = Math.round(plotPx * RENDER_SCALE)
  const laneRows = laneHeight * RENDER_SCALE
  const surface = document.createElement('canvas')
  surface.width = columns
  surface.height = rankBins.length * laneRows
  const ctx = surface.getContext('2d')!
  const image = ctx.createImageData(columns, surface.height)
  const firstWindowBin = fromMs / timeline.bin_ms
  const binsPerColumn = (endMs - fromMs) / timeline.bin_ms / columns

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

const drawLaneNames = (ctx: CanvasRenderingContext2D) => {
  const size = Math.max(13, Math.min(20, Math.round(laneHeight * 0.6)))
  ctx.font = `${size}px ${token('--mono')}`
  if (!hasSublanes) {
    for (const lane of lanes) ctx.fillText(lane.label, showsRankNames ? 36 : 0, laneTop(0, lane) + laneHeight / 2)
    return
  }
  for (const group of groups) {
    const members = lanes.filter((lane) => lane.group === group.key)
    const centre = (laneTop(0, members[0]) + laneTop(0, members.at(-1)!) + laneHeight) / 2
    ctx.fillStyle = token('--text')
    ctx.fillText(group.label, 0, centre)
    ctx.fillStyle = token('--muted')
    ctx.textAlign = 'right'
    if (members.length > 1)
      for (const lane of members) ctx.fillText(lane.label, LABEL_WIDTH - SUBLANE_LABEL_GAP, laneTop(0, lane) + laneHeight / 2)
    ctx.textAlign = 'left'
  }
}

const drawSkeleton = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = `rgb(${TRACK.join(',')})`
  ranks.forEach((_, row) => lanes.forEach((lane) => ctx.fillRect(LABEL_WIDTH, laneTop(row, lane), plotPx, laneHeight)))

  ctx.font = `18px ${token('--mono')}`
  for (const [name, spans] of Object.entries(arm.phases[ranks[0]])) {
    const phase = timeline.phases[name as keyof typeof timeline.phases]
    for (const [start, end] of spans) {
      const left = Math.max(start, fromMs)
      const right = Math.min(end, endMs)
      if (right <= left) continue
      ctx.fillStyle = phase.tint
      ctx.fillRect(xAt(left), 0, (right - left) * pxPerMs, PHASE_HEIGHT)
      if ((right - left) * pxPerMs < 90) continue
      ctx.fillStyle = token('--muted')
      ctx.fillText(phase.label, xAt(left) + 8, PHASE_HEIGHT / 2)
    }
  }

  ctx.fillStyle = token('--muted')
  ctx.font = `20px ${token('--mono')}`
  if (showsRankNames) ranks.forEach((rank, row) => ctx.fillText(`r${rank}`, 0, lanesTop + row * rankPitch + rankBlock / 2))
  drawLaneNames(ctx)
  ctx.fillStyle = token('--muted')
  ctx.font = `18px ${token('--mono')}`
  for (let ms = Math.ceil(fromMs / tickMs) * tickMs; ms <= endMs; ms += tickMs)
    ctx.fillText(String(ms), xAt(ms), lanesTop + lanesHeight + RULER_HEIGHT / 2)
}

const fadeIn = (sinceMs: number) => {
  const progress = Math.max(0, Math.min(1, sinceMs / FADE_MS))
  return progress * progress * (3 - 2 * progress)
}

const drawFrame = () => {
  const ctx = canvas.value!.getContext('2d')!
  const laneRows = laneHeight * RENDER_SCALE
  ctx.clearRect(0, 0, WIDTH, height)
  ctx.textBaseline = 'middle'
  drawSkeleton(ctx)

  lanes.forEach((lane, index) => {
    const layer = layers[index]
    ctx.globalAlpha = fadeIn(elapsedMs - (lane.group === FIRST_GROUP ? 0 : OTHERS_DELAY_MS))
    ranks.forEach((_, row) =>
      ctx.drawImage(layer, 0, row * laneRows, layer.width, laneRows, LABEL_WIDTH, laneTop(row, lane), plotPx, laneHeight),
    )
  })
  ctx.globalAlpha = 1
}

const tick = (now: number) => {
  elapsedMs = now - startedAt
  othersShown.value = elapsedMs >= OTHERS_DELAY_MS
  drawFrame()
  if (elapsedMs < OTHERS_DELAY_MS + FADE_MS) frame = requestAnimationFrame(tick)
}

const play = () => {
  cancelAnimationFrame(frame)
  startedAt = performance.now()
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  canvas.value!.width = WIDTH * RENDER_SCALE
  canvas.value!.height = height * RENDER_SCALE
  canvas.value!.getContext('2d')!.scale(RENDER_SCALE, RENDER_SCALE)
  const rankBins = ranks.map((rank) => decodeRank(arm, rank))
  layers = lanes.map((lane) => renderLayer(lane, rankBins))
  play()
})

watch(isActive, (active) => active && play())
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <div class="legend">
    <template v-if="!hasSublanes">
      <div
        v-for="group in groups"
        :key="group.key"
        class="group"
        :class="{ hidden: group.key !== FIRST_GROUP && !othersShown }"
      >
        <span class="name">{{ group.label }}</span>
        <span v-for="chip in chips(group)" :key="chip.label" class="chip">
          <i :style="{ background: chip.color }" />{{ chip.label }}
        </span>
      </div>
    </template>
    <div class="aside"><slot name="legend-aside" /></div>
  </div>
  <canvas ref="canvas" :style="{ width: `${WIDTH}px`, height: `${height}px` }" />
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 40px;
  margin: 28px 0 16px;
  font-size: 22px;
}

.group {
  display: flex;
  align-items: center;
  gap: 16px;
  transition: opacity 0.9s;
}

.group.hidden {
  opacity: 0;
}

.aside {
  margin-left: auto;
}

.name {
  font-family: var(--mono);
  font-size: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.chip i {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

canvas {
  display: block;
}
</style>
