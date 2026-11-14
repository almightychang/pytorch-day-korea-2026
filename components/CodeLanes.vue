<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Span } from '../composables/codeLanes'
import { timeline } from '../composables/timeline'
import { scenes, type SceneName } from '../scenes'

const props = defineProps<{ scene: SceneName }>()
const { source, code, host, kernels, copies, totalUnits } = scenes[props.scene]

const MS_PER_UNIT = 260
const LANE_WIDTH = 1480
const LANES = ['host', 'device', 'copy']
const pxPerUnit = LANE_WIDTH / totalUnits

const colour = {
  python: timeline.sources.python.color,
  kernel: timeline.sources.gemm.color,
  d2h: timeline.sources.d2h.color,
  h2d: timeline.sources.h2d.color,
}
const copyKinds = [...new Set(copies.map((copy) => copy.kind))]

const now = ref(totalUnits)
const isActive = useIsSlideActive()
let frame = 0

const currentLine = computed(() => host.find((span) => now.value >= span.start && now.value < span.end)?.line)
const revealed = computed(() => `inset(0 ${LANE_WIDTH - now.value * pxPerUnit}px 0 0)`)
const finished = computed(() => now.value >= totalUnits)
const box = (span: Span) => ({
  left: `${span.start * pxPerUnit}px`,
  width: `${(span.end - span.start) * pxPerUnit}px`,
})

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
    <div v-if="source.path" class="bar">{{ source.path }}</div>
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

  <div class="lanes">
    <div v-for="(lane, i) in LANES" :key="lane" class="name" :class="`row-${i}`">{{ lane }}</div>
    <div v-for="(lane, i) in LANES" :key="lane" class="track" :class="`row-${i}`" />
    <div class="plot" :style="{ clipPath: revealed }">
      <div v-for="(span, i) in host" :key="`h${i}`" class="span row-0" :class="span.state" :style="box(span)">
        {{ span.label }}
      </div>
      <div v-for="(span, i) in kernels" :key="`k${i}`" class="span row-1 kernel" :style="box(span)">{{ span.label }}</div>
      <div v-for="(span, i) in copies" :key="`c${i}`" class="span row-2" :class="span.kind" :style="box(span)" />
    </div>
  </div>
  <div class="legend">
    <span><i class="key-python" />python</span>
    <span><i class="key-wait" />waiting for the GPU</span>
    <span><i class="key-kernel" />kernel</span>
    <span v-for="kind in copyKinds" :key="kind"><i :class="`key-${kind}`" />{{ kind }}</span>
    <span class="note">Illustrative, not to scale</span>
  </div>
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

.lanes {
  position: relative;
  height: 160px;
}

.row-0 {
  top: 0;
}

.row-1 {
  top: 56px;
}

.row-2 {
  top: 112px;
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

.track,
.plot {
  position: absolute;
  left: 120px;
  width: 1480px;
}

.track {
  height: 48px;
  background: rgb(26, 32, 40);
}

.plot {
  top: 0;
  height: 160px;
}

.span {
  position: absolute;
  height: 48px;
}

.span.python,
.span.kernel {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: var(--mono);
  font-size: 18px;
  color: var(--bg);
}

.span.python {
  box-shadow: inset -2px 0 0 var(--bg);
  background: v-bind('colour.python');
}

.span.wait {
  background: repeating-linear-gradient(-45deg, #8a90a040 0 8px, transparent 8px 16px);
}

.span.kernel {
  box-shadow: inset -2px 0 0 var(--bg);
  background: v-bind('colour.kernel');
}

.span.d2h {
  background: v-bind('colour.d2h');
}

.span.h2d {
  background: v-bind('colour.h2d');
}

.legend {
  display: flex;
  gap: 36px;
  margin-top: 24px;
  font-size: 22px;
  color: var(--muted);
}

.legend span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend i {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.legend .key-python {
  background: v-bind('colour.python');
}

.legend .key-wait {
  background: repeating-linear-gradient(-45deg, #8a90a080 0 4px, transparent 4px 8px);
}

.legend .key-kernel {
  background: v-bind('colour.kernel');
}

.legend .key-d2h {
  background: v-bind('colour.d2h');
}

.legend .key-h2d {
  background: v-bind('colour.h2d');
}

.legend .note {
  margin-left: auto;
}
</style>
