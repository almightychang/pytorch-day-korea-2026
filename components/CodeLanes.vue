<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { laneColour as colour } from '../composables/laneColours'
import { sceneLegend, sceneRows } from '../composables/sceneLanes'
import { scenes, type SceneName } from '../scenes'

const props = defineProps<{ scene: SceneName }>()
const { source, code, host, kernels, copies, totalUnits } = scenes[props.scene]

const MS_PER_UNIT = 260
const rows = sceneRows({ host, kernels, copies })
const legend = sceneLegend({ host, kernels, copies })

const now = ref(totalUnits)
const isActive = useIsSlideActive()
let frame = 0

const currentLine = computed(() => host.find((span) => now.value >= span.start && now.value < span.end)?.line)
const finished = computed(() => now.value >= totalUnits)

const play = () => {
  cancelAnimationFrame(frame)
  const startedAt = performance.now()
  const tick = (at: number) => {
    now.value = Math.min((at - startedAt) / MS_PER_UNIT, totalUnits)
    if (now.value < totalUnits) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(play)
watch(isActive, (active) => active && play())
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <div class="origin">
    <span class="repo">{{ source.repo }}</span>
    <span>{{ source.users }}</span>
  </div>
  <div class="snippet">
    <div v-if="source.path" class="bar">
      <span>{{ source.path }}</span>
      <span v-if="source.symbol" class="symbol">{{ source.symbol }}</span>
    </div>
    <div v-if="source.excerpts" class="bar excerpts">
      <template v-for="excerpt in source.excerpts" :key="excerpt.path">
        <span>{{ excerpt.path }}</span>
        <code>{{ excerpt.code }}</code>
      </template>
    </div>
    <pre class="code" :class="{ finished }"><div
      v-for="(pieces, index) in code"
      :key="index"
      class="line"
      :class="{ current: currentLine === index + 1 }"
    ><span v-for="([text, side], i) in pieces" :key="i" :class="`on-${side}`">{{ text }}</span></div></pre>
  </div>

  <LaneChart :rows="rows" :total-units="totalUnits" :shown-units="now" />
  <LaneLegend :items="legend" />
</template>

<style scoped>
.origin {
  display: flex;
  justify-content: space-between;
  margin: -16px 0 14px;
  font-family: var(--mono);
  font-size: 20px;
  color: var(--muted);
}

.origin .repo {
  color: var(--text);
}

.snippet {
  margin-bottom: 40px;
  overflow: hidden;
  border-radius: 16px;
  background: var(--panel);
}

.bar {
  padding: 14px 36px;
  background: #ffffff0a;
  font-family: var(--mono);
  font-size: 19px;
  color: var(--muted);
}

.code {
  margin: 0;
  padding: 20px 0;
  font-family: var(--mono);
  font-size: 24px;
  line-height: 1.6;
  --tint: 20%;
  --copy-tint: 34%;
}

.line {
  padding: 0 36px;
  border-left: 6px solid transparent;
  color: var(--muted);
  white-space: pre;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}

.line.current {
  border-left-color: var(--text);
  background: #ffffff10;
  color: var(--text);
}

.code.finished {
  --tint: 42%;
  --copy-tint: 60%;
}

.code.finished .line {
  color: #fff;
}

.line .on-comment {
  color: var(--muted);
}

.bar .symbol {
  float: right;
  color: var(--text);
}

.excerpts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 32px;
}

.excerpts code {
  color: var(--text);
}

.line span {
  padding: 4px 0;
  border-radius: 4px;
  transition: background 0.4s;
}

.line .on-host {
  background: color-mix(in srgb, v-bind('colour.python') var(--tint), transparent);
}

.line .on-device {
  background: color-mix(in srgb, v-bind('colour.kernel') var(--tint), transparent);
}

.line .on-d2h {
  background: color-mix(in srgb, v-bind('colour.d2h') var(--copy-tint), transparent);
}

.line .on-h2d {
  background: color-mix(in srgb, v-bind('colour.h2d') var(--copy-tint), transparent);
}
</style>
