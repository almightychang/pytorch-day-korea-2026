<script setup lang="ts">
import { computed, useId } from 'vue'
import { LANE_LABEL_WIDTH, LANE_WIDTH, type Bar, type Handoff, type Row } from '../composables/lanes'

const props = defineProps<{
  rows: Row[]
  totalUnits: number
  shownUnits?: number
  handoffs?: Handoff[]
  handoffGap?: number
}>()

const LANE_HEIGHT = 48
const LANE_GAP = props.handoffs ? (props.handoffGap ?? 56) : 8
const ARROW_HEAD = 10
const CAPTION_HEIGHT = 40
const pxPerUnit = LANE_WIDTH / props.totalUnits
const hasCaptions = props.rows.some((row) => row.bars.some((bar) => bar.caption))
const height = props.rows.length * (LANE_HEIGHT + LANE_GAP) - LANE_GAP + (hasCaptions ? CAPTION_HEIGHT : 0)

const top = (row: number) => `${row * (LANE_HEIGHT + LANE_GAP)}px`
const revealed = computed(() => `inset(0 ${LANE_WIDTH - (props.shownUnits ?? props.totalUnits) * pxPerUnit}px 0 0)`)
const handoffPath = ({ from, to, straight }: Handoff) => {
  const start = `M ${from * pxPerUnit} ${LANE_HEIGHT}`
  const landing = LANE_HEIGHT + LANE_GAP
  if (straight) return `${start} L ${to * pxPerUnit} ${landing}`
  return `${start} V ${LANE_HEIGHT + LANE_GAP / 2} H ${to * pxPerUnit} V ${landing - ARROW_HEAD}`
}
const markerId = useId()
const headId = (straight?: boolean) => `${markerId}-${straight ? 'along' : 'down'}`
const handoffHead = ({ straight }: Handoff) => `url(#${headId(straight)})`
const box = (bar: Bar, row: number) => ({
  top: top(row),
  left: `${bar.start * pxPerUnit}px`,
  width: `${(bar.end - bar.start) * pxPerUnit}px`,
  background: bar.fill,
})
</script>

<template>
  <div class="lanes" :style="{ height: `${height}px` }">
    <template v-for="(row, i) in rows" :key="row.name">
      <div class="name" :style="{ top: top(i) }">{{ row.name }}</div>
      <div class="track" :style="{ top: top(i), left: `${LANE_LABEL_WIDTH}px`, width: `${LANE_WIDTH}px` }" />
    </template>
    <div class="plot" :style="{ clipPath: revealed, left: `${LANE_LABEL_WIDTH}px`, width: `${LANE_WIDTH}px` }">
      <template v-for="(row, i) in rows" :key="row.name">
        <div v-for="(bar, j) in row.bars" :key="j" class="bar" :class="bar.look" :style="box(bar, i)">
          {{ bar.label }}
        </div>
        <div
          v-for="(bar, j) in row.bars.filter((bar) => bar.caption)"
          :key="`caption-${j}`"
          class="caption"
          :style="{ top: `calc(${top(i)} + ${LANE_HEIGHT}px)`, left: `${(bar.start + bar.end) / 2 * pxPerUnit}px` }"
        >
          {{ bar.caption }}
        </div>
      </template>
      <svg v-if="handoffs" class="handoffs" :width="LANE_WIDTH" :height="height">
        <defs>
          <marker
            :id="headId(false)"
            markerUnits="userSpaceOnUse"
            :markerWidth="ARROW_HEAD"
            :markerHeight="ARROW_HEAD"
            :refX="ARROW_HEAD / 2"
            refY="0"
            orient="0"
          >
            <path :d="`M 0 0 L ${ARROW_HEAD} 0 L ${ARROW_HEAD / 2} ${ARROW_HEAD} Z`" />
          </marker>
          <marker
            :id="headId(true)"
            markerUnits="userSpaceOnUse"
            :markerWidth="ARROW_HEAD"
            :markerHeight="ARROW_HEAD"
            :refX="ARROW_HEAD"
            :refY="ARROW_HEAD / 2"
            orient="auto"
          >
            <path :d="`M 0 0 L ${ARROW_HEAD} ${ARROW_HEAD / 2} L 0 ${ARROW_HEAD} Z`" />
          </marker>
        </defs>
        <path v-for="(handoff, i) in handoffs" :key="i" :d="handoffPath(handoff)" :marker-end="handoffHead(handoff)" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.lanes {
  position: relative;
}

.name {
  position: absolute;
  left: 0;
  height: 48px;
  display: flex;
  align-items: center;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--text);
}

.track {
  position: absolute;
  height: 48px;
  background: rgb(26, 32, 40);
}

.plot {
  position: absolute;
  top: 0;
  height: 100%;
}

.bar {
  position: absolute;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 18px;
  color: var(--muted);
}

.caption {
  position: absolute;
  padding-top: 8px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 18px;
  color: var(--muted);
}

.handoffs {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
}

.handoffs path {
  fill: none;
  stroke: var(--muted);
  stroke-width: 3;
}

.handoffs marker path {
  fill: var(--muted);
  stroke: none;
}

.bar.solid {
  box-shadow: inset -2px 0 0 var(--bg);
  color: var(--bg);
}

.bar.waiting {
  background: repeating-linear-gradient(-45deg, #8a90a040 0 8px, transparent 8px 16px);
}
</style>
