<script setup lang="ts">
import { THEMES } from '../composables/themes'

const FIXED = 256
const PER_BATCH = [196, 256, 225, 144]
const RECOMPILE_LIMIT = 8
const CASES = [
  {
    title: 'shapes vary',
    calls: PER_BATCH.map((size, call) => ({ size, hit: false, result: call === 0 ? 'compile' : 'recompile' })),
    ending: `… after ${RECOMPILE_LIMIT} → eager`,
  },
  {
    title: 'shapes fixed',
    calls: PER_BATCH.map((_, call) => ({ size: FIXED, hit: call > 0, result: call === 0 ? 'compile' : 'reuse' })),
    ending: 'one kernel, every call',
  },
]
</script>

<template>
  <div class="fixed-shapes">
    <section v-for="example in CASES" :key="example.title">
      <h3>{{ example.title }}</h3>
      <div v-for="(call, index) in example.calls" :key="index" class="call">
        <span class="shape"><em :style="{ width: `${call.size}px` }" />{{ call.size }}</span>
        <span class="arrow">→</span>
        <span class="guard" :class="{ hit: call.hit, miss: index > 0 && !call.hit }">guard</span>
        <span class="arrow">→</span>
        <b :class="{ reuse: call.hit }">{{ call.result }}</b>
      </div>
      <p class="ending">{{ example.ending }}</p>
    </section>
  </div>
  <IllustrativeBadge class="badge" />
</template>

<style scoped>
.fixed-shapes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 120px;
  margin-top: 40px;
}

h3 {
  margin: 0 0 24px;
  font-family: var(--mono);
  font-size: 26px;
  font-weight: 400;
  color: var(--muted);
}

.call {
  display: grid;
  grid-template-columns: 330px auto auto auto 1fr;
  align-items: center;
  gap: 20px;
  height: 64px;
  margin-bottom: 12px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.shape {
  display: flex;
  align-items: center;
  gap: 16px;
}

em {
  height: 40px;
  border-radius: 4px;
  background: #8a90a0;
}

.arrow {
  font-size: 28px;
}

.guard {
  padding: 6px 14px;
  border: 2px solid #8a90a066;
  border-radius: 8px;
}

.guard.hit {
  border-color: var(--compute);
  color: var(--compute);
}

.guard.miss {
  border-color: var(--accent);
  color: var(--accent);
}

b {
  font-weight: 600;
  color: var(--text);
}

b.reuse {
  color: color-mix(in srgb, v-bind('THEMES.kernel.colour') 80%, var(--text));
}

.ending {
  margin: 20px 0 0;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--text);
}

.badge {
  display: block;
  width: fit-content;
  margin: 48px 0 0 auto;
}
</style>
