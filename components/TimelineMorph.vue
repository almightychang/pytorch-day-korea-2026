<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { type Arm, armByTag, decodeRank, microsteps, timeline } from '../composables/timeline'
import { groupLane, laneGroups, renderLaneLayer, TRACK } from '../composables/timelineLanes'

const props = defineProps<{ step: number }>()

const WIDTH = 1600
const LABEL_PX = 96
const LANE_PX = 14
const LANE_GAP_PX = 3
const RANK_GAP_PX = 17
const PHASE_PX = 24
const PHASE_GAP_PX = 8
const RULER_PX = 32
const RENDER_SCALE = 3
const TICK_MS = 250
const MIN_PHASE_LABEL_PX = 90
const DURATION_MS = 1600
const SEGMENTS_PER_MICROSTEP = 3

const lanes = laneGroups.map(groupLane)
const [forwardPhase, backwardPhase] = Object.values(timeline.phases)
const runs = ['before', 'after'].map((tag) => {
  const arm = armByTag(tag)
  const steps = microsteps(arm)
  return {
    arm,
    boundaries: arm.ranks.map((_, rank) => [
      0,
      ...steps.filter((step) => step.rank === rank).flatMap((step) => [step.fromMs, step.forwardEndMs, step.toMs]),
      arm.wall_ms,
    ]),
  }
})
const [before, after] = runs
const rankCount = before.arm.ranks.length
const pxPerMs = (WIDTH - LABEL_PX) / Math.max(...runs.map((run) => run.arm.wall_ms))
const rankBlock = lanes.length * (LANE_PX + LANE_GAP_PX) - LANE_GAP_PX
const rankPitch = rankBlock + RANK_GAP_PX
const lanesTop = PHASE_PX + PHASE_GAP_PX
const lanesHeight = rankCount * rankPitch - RANK_GAP_PX
const height = lanesTop + lanesHeight + RULER_PX

const canvas = ref<HTMLCanvasElement>()
const progress = ref(props.step >= 1 ? 1 : 0)
let layers: HTMLCanvasElement[][] = []
let frame = 0

const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const mix = (from: number, to: number) => from + (to - from) * progress.value
const xAt = (ms: number) => LABEL_PX + ms * pxPerMs
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const renderLayers = (arm: Arm) => {
  const rankBins = arm.ranks.map((_, rank) => decodeRank(arm, rank))
  const columns = Math.round(arm.wall_ms * pxPerMs * RENDER_SCALE)
  return lanes.map((lane) => renderLaneLayer(arm, lane, rankBins, { fromMs: 0, toMs: arm.wall_ms }, columns, LANE_PX * RENDER_SCALE))
}

const drawSegment = (ctx: CanvasRenderingContext2D, run: number, lane: number, rank: number, segment: number, left: number, width: number, top: number) => {
  const { arm, boundaries } = runs[run]
  const layer = layers[run][lane]
  const sourceLeft = (boundaries[rank][segment] / arm.wall_ms) * layer.width
  const sourceWidth = ((boundaries[rank][segment + 1] - boundaries[rank][segment]) / arm.wall_ms) * layer.width
  if (sourceWidth < 1 || width <= 0) return
  const laneRows = LANE_PX * RENDER_SCALE
  ctx.drawImage(layer, sourceLeft, rank * laneRows, sourceWidth, laneRows, left, top, width, LANE_PX)
}

const drawPhases = (ctx: CanvasRenderingContext2D, edges: number[]) => {
  ctx.font = `18px ${token('--mono')}`
  edges.slice(0, -1).forEach((start, segment) => {
    const phase = [undefined, forwardPhase, backwardPhase][segment % SEGMENTS_PER_MICROSTEP]
    if (!phase) return
    const width = (edges[segment + 1] - start) * pxPerMs
    ctx.fillStyle = phase.tint
    ctx.fillRect(xAt(start), 0, width, PHASE_PX)
    if (width < MIN_PHASE_LABEL_PX) return
    ctx.fillStyle = token('--muted')
    ctx.fillText(phase.label, xAt(start) + 8, PHASE_PX / 2)
  })
}

const draw = () => {
  const ctx = canvas.value!.getContext('2d')!
  ctx.clearRect(0, 0, WIDTH, height)
  ctx.textBaseline = 'middle'
  const edgesOf = (rank: number) => before.boundaries[rank].map((ms, edge) => mix(ms, after.boundaries[rank][edge]))

  drawPhases(ctx, edgesOf(0))
  for (let rank = 0; rank < rankCount; rank++) {
    const edges = edgesOf(rank)
    lanes.forEach((_, lane) => {
      const top = lanesTop + rank * rankPitch + lane * (LANE_PX + LANE_GAP_PX)
      ctx.fillStyle = `rgb(${TRACK.join(',')})`
      ctx.fillRect(LABEL_PX, top, edges.at(-1)! * pxPerMs, LANE_PX)
      edges.slice(0, -1).forEach((start, segment) => {
        const width = (edges[segment + 1] - start) * pxPerMs
        ctx.globalAlpha = 1
        drawSegment(ctx, 0, lane, rank, segment, xAt(start), width, top)
        ctx.globalAlpha = progress.value
        drawSegment(ctx, 1, lane, rank, segment, xAt(start), width, top)
      })
      ctx.globalAlpha = 1
    })
    ctx.fillStyle = token('--muted')
    ctx.font = `20px ${token('--mono')}`
    ctx.fillText(`r${rank}`, 0, lanesTop + rank * rankPitch + rankBlock / 2)
  }

  ctx.font = `18px ${token('--mono')}`
  const wallMs = mix(before.arm.wall_ms, after.arm.wall_ms)
  for (let ms = 0; ms <= wallMs; ms += TICK_MS) ctx.fillText(String(ms), xAt(ms), lanesTop + lanesHeight + RULER_PX / 2)
}

const animateTo = (target: number) => {
  cancelAnimationFrame(frame)
  const from = progress.value
  const startedAt = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - startedAt) / DURATION_MS, 1)
    progress.value = from + (target - from) * easeInOut(t)
    draw()
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(() => {
  canvas.value!.width = WIDTH * RENDER_SCALE
  canvas.value!.height = height * RENDER_SCALE
  canvas.value!.getContext('2d')!.scale(RENDER_SCALE, RENDER_SCALE)
  layers = runs.map((run) => renderLayers(run.arm))
  draw()
  document.fonts.ready.then(draw)
})
watch(() => props.step >= 1, (optimized) => animateTo(optimized ? 1 : 0))
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <TimelineLegend chips>
    <span class="run">{{ progress < 0.5 ? 'before' : 'after' }}</span>
  </TimelineLegend>
  <canvas ref="canvas" :style="{ width: `${WIDTH}px`, height: `${height}px` }" />
</template>

<style scoped>
canvas {
  display: block;
}

.run {
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}
</style>
