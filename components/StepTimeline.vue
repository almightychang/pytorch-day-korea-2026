<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { armByTag, decodeRank, type SourceKey, timeline } from '../composables/timeline'
import { groupLane, laneGroups as groups, type LaneGroup as Group, renderLaneLayer, sourceColour, TRACK } from '../composables/timelineLanes'

const props = withDefaults(
  defineProps<{
    arm?: string
    ranks?: number[]
    fromMs?: number
    toMs?: number
    laneHeight?: number
    sublanes?: string[]
    highlight?: string[]
    deviceFirst?: boolean
  }>(),
  { arm: 'base', laneHeight: 14, sublanes: () => [] },
)

type Lane = { group: string; label: string; sources: SourceKey[]; colour?: string; top: number }

const WIDTH = 1600
const PHASE_HEIGHT = 24
const PHASE_GAP = 8
const RULER_HEIGHT = 32
const RENDER_SCALE = 3
const TICK_STEPS_MS = [10, 25, 50, 100, 250, 500, 1000]
const MIN_TICK_PX = 110
const FADE_MS = 900
const DEVICE_GROUP = 'device'
const OTHERS_DELAY_MS = 2000
const DIMMED = 0.16
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
    : [groupLane(group)]

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

const isDimmed = (lane: Lane) =>
  props.highlight !== undefined &&
  !props.highlight.includes(lane.group) &&
  !lane.sources.some((source) => props.highlight!.includes(source))
const revealDelayMs = (lane: Lane) => (props.deviceFirst && lane.group !== DEVICE_GROUP ? OTHERS_DELAY_MS : 0)

const canvas = ref<HTMLCanvasElement>()
const isActive = useIsSlideActive()
let layers: HTMLCanvasElement[] = []
let frame = 0
let startedAt = 0
let elapsedMs = 0

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

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
    ctx.globalAlpha = members.every(isDimmed) ? 0.35 : 1
    ctx.fillText(group.label, 0, centre)
    ctx.globalAlpha = 1
    ctx.fillStyle = token('--muted')
    ctx.textAlign = 'right'
    if (members.length > 1)
      for (const lane of members) {
        ctx.globalAlpha = isDimmed(lane) ? 0.35 : 1
        ctx.fillText(lane.label, LABEL_WIDTH - SUBLANE_LABEL_GAP, laneTop(0, lane) + laneHeight / 2)
      }
    ctx.globalAlpha = 1
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
    ctx.globalAlpha = fadeIn(elapsedMs - revealDelayMs(lane)) * (isDimmed(lane) ? DIMMED : 1)
    ranks.forEach((_, row) =>
      ctx.drawImage(layer, 0, row * laneRows, layer.width, laneRows, LABEL_WIDTH, laneTop(row, lane), plotPx, laneHeight),
    )
  })
  ctx.globalAlpha = 1
}

const tick = (now: number) => {
  elapsedMs = now - startedAt
  drawFrame()
  if (elapsedMs < FADE_MS + (props.deviceFirst ? OTHERS_DELAY_MS : 0)) frame = requestAnimationFrame(tick)
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
  layers = lanes.map((lane) =>
    renderLaneLayer(arm, lane, rankBins, { fromMs, toMs: endMs }, Math.round(plotPx * RENDER_SCALE), laneHeight * RENDER_SCALE),
  )
  play()
})

watch(isActive, (active) => active && play())
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <TimelineLegend :chips="!hasSublanes"><slot name="legend-aside" /></TimelineLegend>
  <canvas ref="canvas" :style="{ width: `${WIDTH}px`, height: `${height}px` }" />
</template>

<style scoped>
canvas {
  display: block;
}
</style>
