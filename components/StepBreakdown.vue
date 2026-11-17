<script setup lang="ts">
import { BASELINE_STEP_MS as step, type BucketKey, BUCKETS, stepTotal } from '../composables/stepBuckets'

defineProps<{ bracket?: boolean }>()

const MIN_LABELED_MS = 400

const total = stepTotal(step)
const share = (key: BucketKey) => Math.round((step[key] / total) * 100)
const computeShare = (step.compute / total) * 100
</script>

<template>
  <div v-if="bracket" class="bracket" :style="{ marginLeft: `${computeShare}%` }">
    {{ 100 - share('compute') }}% WASTED
  </div>
  <div class="scale">RLDX-1.0 · 1 step</div>
  <div class="bar">
    <div
      v-for="bucket in BUCKETS"
      :key="bucket.key"
      class="segment"
      :class="{ waiting: bucket.key !== 'compute' }"
      :style="{ flex: step[bucket.key], '--tone': bucket.colour }"
    >
      <template v-if="step[bucket.key] >= MIN_LABELED_MS">{{ share(bucket.key) }}%</template>
    </div>
  </div>
  <div class="legend">
    <div v-for="bucket in BUCKETS" :key="bucket.key" class="entry">
      <i :style="{ background: bucket.colour }" />
      <span class="label">{{ bucket.label }}</span>
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
