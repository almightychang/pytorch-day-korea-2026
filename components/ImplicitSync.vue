<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { timeline } from '../composables/timeline'

type HostState = 'python' | 'wait'
type HostSpan = { line: number; state: HostState; start: number; end: number }
type Span = { start: number; end: number }

type Side = 'host' | 'device' | 'readback'
type Piece = [text: string, side: Side]

const CODE: Piece[][] = [
  [['max_hw = int(', 'host'], ['grid_thw[:, 1:].max()', 'device'], ['.item()', 'readback'], [')', 'host']],
  [['freq_table = ', 'host'], ['self.rotary_pos_emb(max_hw)', 'device']],
  [['total_tokens = int(', 'host'], ['torch.prod(grid_thw, dim=1).sum()', 'device'], ['.item()', 'readback'], [')', 'host']],
  [['for num_frames, height, width in ', 'host'], ['grid_thw', 'device'], [':', 'host']],
  [['    merged_h, merged_w = ', 'host'], ['height // merge_size, width // merge_size', 'device']],
  [['    block_rows = ', 'host'], ['torch.arange(', 'device'], ['merged_h', 'readback'], [', device=device)', 'device']],
]
const SOURCE = {
  repo: 'huggingface/transformers@v4.57.3',
  path: 'src/transformers/models/qwen3_vl/modeling_qwen3_vl.py#L606-L617',
  users: 'used by GR00T N1.7, RLDX',
}
const LOOP_ITERATIONS = 3
const MS_PER_UNIT = 260
const READBACK_UNITS = 0.4
const LANE_WIDTH = 1480
const LANES = ['host', 'device', 'copy']

const hostSpans: HostSpan[] = []
const kernelSpans: (Span & { name: string })[] = []
const copySpans: Span[] = []
let hostClock = 0
let gpuFreeAt = 0

const python = (line: number, units: number) => {
  hostSpans.push({ line, state: 'python', start: hostClock, end: hostClock + units })
  hostClock += units
}
const launch = (name: string, units: number) => {
  const start = Math.max(hostClock, gpuFreeAt)
  kernelSpans.push({ name, start, end: start + units })
  gpuFreeAt = start + units
}
const readValue = (line: number) => {
  const copyStart = Math.max(hostClock, gpuFreeAt)
  const copyEnd = copyStart + READBACK_UNITS
  copySpans.push({ start: copyStart, end: copyEnd })
  hostSpans.push({ line, state: 'wait', start: hostClock, end: copyEnd })
  hostClock = copyEnd
}

python(1, 1)
launch('max', 2)
readValue(1)
python(2, 1.5)
launch('rope', 3)
python(3, 1)
launch('prod', 1)
launch('sum', 1)
readValue(3)
for (let i = 0; i < LOOP_ITERATIONS; i++) {
  python(4, 1)
  launch('idx', 0.6)
  python(5, 0.8)
  launch('div', 0.6)
  launch('div', 0.6)
  python(6, 0.5)
  readValue(6)
  python(6, 0.5)
  launch('arange', 1)
}
const totalUnits = Math.max(hostClock, gpuFreeAt)
const pxPerUnit = LANE_WIDTH / totalUnits

const now = ref(totalUnits)
const isActive = useIsSlideActive()
let frame = 0

const currentLine = computed(() => hostSpans.find((span) => now.value >= span.start && now.value < span.end)?.line)
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

const colour = {
  python: timeline.sources.python.color,
  kernel: timeline.sources.gemm.color,
  readback: timeline.sources.d2h.color,
}
</script>

<template>
  <div class="origin">
    <span class="repo">{{ SOURCE.repo }}</span>
    <span>{{ SOURCE.users }}</span>
  </div>
  <div class="snippet">
    <div class="bar">{{ SOURCE.path }}</div>
    <pre class="code" :class="{ finished }"><div
      v-for="(pieces, index) in CODE"
      :key="index"
      class="line"
      :class="{ current: currentLine === index + 1 }"
    ><span v-for="([text, side], i) in pieces" :key="i" :class="`on-${side}`">{{ text }}</span></div></pre>
  </div>

  <div class="lanes" :style="{ '--python': colour.python, '--kernel': colour.kernel, '--readback': colour.readback }">
    <div v-for="(lane, i) in LANES" :key="lane" class="name" :class="`row-${i}`">{{ lane }}</div>
    <div v-for="(lane, i) in LANES" :key="lane" class="track" :class="`row-${i}`" />
    <div class="plot" :style="{ clipPath: revealed }">
      <div v-for="(span, i) in hostSpans" :key="`h${i}`" class="span row-0" :class="span.state" :style="box(span)" />
      <div v-for="(span, i) in kernelSpans" :key="`k${i}`" class="span row-1 kernel" :style="box(span)">{{ span.name }}</div>
      <div v-for="(span, i) in copySpans" :key="`c${i}`" class="span row-2 copy" :style="box(span)" />
    </div>
  </div>
  <div class="legend">
    <span><i class="key-python" />python</span>
    <span><i class="key-wait" />waiting for the GPU</span>
    <span><i class="key-kernel" />kernel</span>
    <span><i class="key-readback" />d2h</span>
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
  --readback-tint: 34%;
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
  --readback-tint: 60%;
}

.code.finished .line {
  color: #fff;
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

.line .on-readback {
  background: color-mix(in srgb, v-bind('colour.readback') var(--readback-tint), transparent);
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

.span.python {
  background: var(--python);
}

.span.wait {
  background: repeating-linear-gradient(-45deg, #8a90a040 0 8px, transparent 8px 16px);
}

.span.kernel {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset -2px 0 0 var(--bg);
  font-family: var(--mono);
  font-size: 18px;
  color: var(--bg);
  background: var(--kernel);
}

.span.copy {
  background: var(--readback);
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

.legend .key-readback {
  background: v-bind('colour.readback');
}

.legend .note {
  margin-left: auto;
}
</style>
