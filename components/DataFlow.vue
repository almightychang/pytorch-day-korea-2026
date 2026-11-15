<script setup lang="ts">
import { computed, useId } from 'vue'
import type { FlowNode, Lane } from '../composables/dataFlow'
import { laneColour } from '../composables/laneColours'
import { THEMES } from '../composables/themes'

const props = withDefaults(defineProps<{ lanes: Lane[]; nodes: FlowNode[]; columnPx?: number }>(), { columnPx: 255 })

const LABEL_PX = 190
const NODE_GAP_PX = 50
const HEADING_PX = 96
const DETAIL_PX = 38
const LANE_GAP_PX = 64
const ARROW_HEAD = 10
const COPY = { host: { name: 'D2H', colour: laneColour.d2h }, device: { name: 'H2D', colour: laneColour.h2d } }

const nodeWidth = props.columnPx - NODE_GAP_PX
const nodeHeight = HEADING_PX + Math.max(...props.nodes.map((node) => node.details?.length ?? 0)) * DETAIL_PX
const laneIndex = (name: string) => props.lanes.findIndex((lane) => lane.name === name)
const laneTop = (name: string) => laneIndex(name) * (nodeHeight + LANE_GAP_PX)
const height = props.lanes.length * (nodeHeight + LANE_GAP_PX) - LANE_GAP_PX
const sideOf = (name: string) => props.lanes[laneIndex(name)].side
const dividerAbove = (name: string) => laneTop(name) - LANE_GAP_PX / 2
const boundaryTop = dividerAbove(props.lanes.find((lane) => lane.side === 'device')!.name)
const width = props.nodes.length * props.columnPx - NODE_GAP_PX
const left = (index: number) => index * props.columnPx
const middle = (name: string) => laneTop(name) + nodeHeight / 2

const edges = computed(() =>
  props.nodes.slice(1).map((to, index) => {
    const from = props.nodes[index]
    const startX = left(index) + nodeWidth
    const endX = left(index + 1) - ARROW_HEAD
    const turnX = startX + NODE_GAP_PX / 2
    const turns = from.lane !== to.lane
    const copies = sideOf(from.lane) !== sideOf(to.lane)
    return {
      path: turns
        ? `M ${startX} ${middle(from.lane)} H ${turnX} V ${middle(to.lane)} H ${endX}`
        : `M ${startX} ${middle(from.lane)} H ${endX}`,
      colour: copies ? COPY[sideOf(to.lane)].colour : undefined,
      tag: copies && !to.isCopy ? { ...COPY[sideOf(to.lane)], x: turnX, y: boundaryTop } : undefined,
    }
  }),
)
const markerId = useId()
const tint = (node: FlowNode) =>
  node.theme ? { background: `color-mix(in srgb, ${THEMES[node.theme].colour} 30%, transparent)` } : undefined
</script>

<template>
  <div class="data-flow" :style="{ width: `${LABEL_PX + width}px`, height: `${height}px` }">
    <span v-for="lane in lanes" :key="lane.name" class="lane" :style="{ top: `${middle(lane.name)}px` }">
      <small>{{ lane.kind ?? lane.side }}</small>{{ lane.name }}
    </span>
    <div v-for="lane in lanes.slice(1)" :key="lane.name" class="divider" :style="{ top: `${dividerAbove(lane.name)}px`, left: `${LABEL_PX}px`, width: `${width}px` }" />

    <div class="plot" :style="{ left: `${LABEL_PX}px`, width: `${width}px`, height: `${height}px` }">
      <svg :width="width" :height="height">
        <defs>
          <marker :id="markerId" :markerWidth="ARROW_HEAD" :markerHeight="ARROW_HEAD" :refX="0" :refY="ARROW_HEAD / 2" orient="auto" markerUnits="userSpaceOnUse">
            <path :d="`M 0 0 L ${ARROW_HEAD} ${ARROW_HEAD / 2} L 0 ${ARROW_HEAD} z`" />
          </marker>
        </defs>
        <path
          v-for="(edge, index) in edges"
          :key="index"
          :d="edge.path"
          :marker-end="`url(#${markerId})`"
          :style="{ stroke: edge.colour }"
        />
      </svg>
      <template v-for="(edge, index) in edges" :key="index">
        <span v-if="edge.tag" class="copy" :style="{ left: `${edge.tag.x}px`, top: `${edge.tag.y}px`, background: edge.tag.colour }">
          {{ edge.tag.name }}
        </span>
      </template>
      <div
        v-for="(node, index) in nodes"
        :key="index"
        class="node"
        :class="{ plain: !node.details }"
        :style="{ left: `${left(index)}px`, top: `${laneTop(node.lane)}px`, width: `${nodeWidth}px`, height: `${nodeHeight}px`, ...tint(node) }"
      >
        <b>{{ node.label }}</b>
        <span v-for="detail in node.details" :key="detail">{{ detail }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-flow {
  position: relative;
}

.lane {
  position: absolute;
  left: 0;
  transform: translateY(-50%);
  font-family: var(--mono);
  font-size: 22px;
  line-height: 1.3;
  white-space: nowrap;
  color: var(--text);
}

.lane small {
  display: block;
  font-size: 18px;
  color: var(--muted);
}

.divider {
  position: absolute;
  border-top: 2px dashed #8a90a055;
}

.plot {
  position: absolute;
  top: 0;
}

svg {
  position: absolute;
  inset: 0;
  overflow: visible;
}

svg path {
  fill: none;
  stroke: var(--muted);
  stroke-width: 3;
}

svg marker path {
  fill: context-stroke;
  stroke: none;
}

.copy {
  position: absolute;
  transform: translate(-50%, -50%);
  padding: 2px 10px;
  border-radius: 4px;
  font-family: var(--mono);
  font-size: 18px;
  white-space: nowrap;
  color: var(--bg);
}

.node {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  border-radius: 12px;
  white-space: nowrap;
  background: var(--panel);
  font-family: var(--mono);
  font-size: 22px;
  line-height: 38px;
  color: var(--muted);
}

.node.plain {
  align-items: center;
}

.node b {
  font-family: Pretendard, system-ui, sans-serif;
  font-size: 25px;
  font-weight: 600;
  color: var(--text);
}
</style>
