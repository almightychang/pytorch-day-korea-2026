<script setup lang="ts">
defineProps<{ bracket?: boolean }>()

type Segment = { label: string; ms: number; color: string }

const COMPUTE: Segment = { label: 'Compute', ms: 1348.9, color: 'var(--compute)' }
const COPIES: Segment = { label: 'Copy', ms: 70.5, color: 'var(--other)' }

const SEGMENTS: Segment[] = [
  COMPUTE,
  { label: 'No kernel', ms: 854.0, color: 'var(--python)' },
  { label: 'NCCL', ms: 616.0, color: 'var(--wait)' },
  COPIES,
]

const MIN_LABELED_MS = 400

const total = SEGMENTS.reduce((sum, s) => sum + s.ms, 0)
const share = (s: Segment) => Math.round((s.ms / total) * 100)
const computeShare = (COMPUTE.ms / total) * 100
</script>

<template>
  <div v-if="bracket" class="bracket" :style="{ marginLeft: `${computeShare}%` }">
    {{ 100 - share(COMPUTE) }}% WASTED
  </div>
  <div class="scale">1 step</div>
  <div class="bar">
    <div
      v-for="s in SEGMENTS"
      :key="s.label"
      class="segment"
      :class="{ waiting: s !== COMPUTE }"
      :style="{ flex: s.ms, '--tone': s.color }"
    >
      <template v-if="s.ms >= MIN_LABELED_MS">{{ share(s) }}%</template>
    </div>
  </div>
  <div class="legend">
    <div v-for="s in SEGMENTS" :key="s.label" class="entry">
      <i :style="{ background: s.color }" />
      <span class="label">{{ s.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.bracket {
  margin-bottom: -38px;
  text-align: center;
  font-family: var(--mono);
  font-size: 88px;
  font-weight: 600;
  background:
    linear-gradient(var(--text), var(--text)) left bottom / 4px 28px no-repeat,
    linear-gradient(var(--text), var(--text)) right bottom / 4px 28px no-repeat,
    linear-gradient(var(--text), var(--text)) center bottom 24px / 100% 4px no-repeat;
  padding-bottom: 52px;
}

.scale {
  margin-bottom: 12px;
  font-family: var(--mono);
  font-size: 26px;
  color: var(--muted);
}

.bar {
  display: flex;
  gap: 4px;
  height: 92px;
}

.segment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 34px;
  font-weight: 600;
  color: var(--bg);
  background: var(--tone);
}

.segment.waiting {
  color: var(--tone);
  background: repeating-linear-gradient(
    -45deg,
    color-mix(in srgb, var(--tone) 38%, transparent) 0 10px,
    color-mix(in srgb, var(--tone) 14%, transparent) 10px 20px
  );
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 40px;
  margin-top: 24px;
  font-size: 26px;
}

.entry {
  display: flex;
  align-items: center;
  gap: 12px;
}

.entry i {
  width: 24px;
  height: 24px;
  border-radius: 6px;
}
</style>
