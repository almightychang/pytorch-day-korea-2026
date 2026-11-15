<script setup lang="ts">
import { deviceShare } from '../composables/deviceShare'
import { armByTag } from '../composables/timeline'

const RUNS = [
  { name: 'before', seconds: 2.6521 },
  { name: 'after', seconds: 1.2136 },
]
const PX_PER_SECOND = 480

const [before, after] = ['base', 'p232'].map((tag) => deviceShare(armByTag(tag)))
const percent = (share: number) => `${Math.round(share * 100)}%`
const SHARES = [
  { label: 'GPU utilization', note: 'any kernel, as nvidia-smi counts it', from: before.anyKernel, to: after.anyKernel },
  { label: 'compute · forward', from: before.forward, to: after.forward },
  { label: 'compute · backward', from: before.backward, to: after.backward },
  { label: 'compute · total', note: 'NCCL excluded', from: before.compute, to: after.compute },
]
</script>

<template>
  <div class="step-period">
    <div v-for="run in RUNS" :key="run.name" class="run" :class="run.name">
      <span>{{ run.name }}</span>
      <i :style="{ width: `${run.seconds * PX_PER_SECOND}px` }" />
      <b>{{ run.seconds.toFixed(3) }} s</b>
    </div>
  </div>
  <dl>
    <div v-for="share in SHARES" :key="share.label">
      <dt>{{ share.label }}</dt>
      <dd><span>{{ percent(share.from) }}</span> → {{ percent(share.to) }}</dd>
      <small v-if="share.note">{{ share.note }}</small>
    </div>
  </dl>
  <p class="foot">Optimizer-step period · 8 × H200 · 50 steps. Shares from one profiled step, 8-rank mean.</p>
</template>

<style scoped>
.step-period {
  display: flex;
  flex-direction: column;
  gap: 36px;
  margin-top: 64px;
}

.run {
  display: flex;
  align-items: center;
  font-family: var(--mono);
  font-size: 26px;
  color: var(--muted);
}

.run span {
  width: 130px;
}

.run i {
  height: 88px;
  border-radius: 6px;
  background: #8a90a0;
}

.run.after i {
  background: var(--text);
}

.run b {
  margin-left: 28px;
  font-family: Pretendard, system-ui, sans-serif;
  font-size: 44px;
  font-weight: 700;
  color: var(--text);
}

.run.before b {
  color: var(--muted);
}

dl {
  display: grid;
  grid-template-columns: repeat(4, auto);
  justify-content: space-between;
  margin: 64px 0 0;
}

dt {
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}

dd {
  margin: 10px 0 8px;
  font-size: 46px;
  font-weight: 700;
  line-height: 1.1;
}

dd span {
  color: var(--muted);
}

small {
  font-size: 22px;
  color: var(--muted);
}

.foot {
  margin: 56px 0 0;
  font-size: 22px;
  color: var(--muted);
}
</style>
