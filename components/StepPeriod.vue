<script setup lang="ts">
import { deviceShare } from '../composables/deviceShare'
import { armByTag } from '../composables/timeline'
import type { Run } from './RunBars.vue'

const RUNS: Run[] = [
  { name: 'before', value: 3.03, tone: 'muted' },
  { name: 'after', value: 1.34 },
]
const PX_PER_SECOND = 420

const [before, after] = ['base', 'p232'].map((tag) => deviceShare(armByTag(tag)))
const percent = (share: number) => `${Math.round(share * 100)}%`
const SHARES = [
  { label: 'nvidia-smi · GPU util', from: before.anyKernel, to: after.anyKernel },
  { label: 'compute · total', from: before.compute, to: after.compute },
  { label: 'compute · forward', from: before.forward, to: after.forward },
  { label: 'compute · backward', from: before.backward, to: after.backward },
]
</script>

<template>
  <RunBars class="period" :runs="RUNS" unit="s" :px-per-unit="PX_PER_SECOND" :digits="2" />
  <dl>
    <div v-for="share in SHARES" :key="share.label">
      <dt>{{ share.label }}</dt>
      <dd><span>{{ percent(share.from) }}</span> → {{ percent(share.to) }}</dd>
    </div>
  </dl>
  <SourceNote
    site="github"
    title="RLWRLD/RLDX-1 v1.1.0"
    detail="docs/optimization.md · 8 × H200"
    href="https://github.com/RLWRLD/RLDX-1/blob/v1.1.0/docs/optimization.md"
  />
</template>

<style scoped>
.period {
  margin-top: 48px;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: center;
  gap: 44px 360px;
  margin: 60px 0 0;
}

dt {
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}

dd {
  margin: 10px 0 0;
  font-size: 62px;
  font-weight: 700;
  line-height: 1.1;
}

dd span {
  color: var(--muted);
}

</style>
