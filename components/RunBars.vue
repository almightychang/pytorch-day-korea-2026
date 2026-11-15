<script setup lang="ts">
export type Run = { name: string; value?: number; tone?: 'muted'; note?: string }

defineProps<{ runs: Run[]; unit: string; pxPerUnit: number; digits: number; compact?: boolean }>()
</script>

<template>
  <div class="run-bars" :class="{ compact }">
    <template v-for="run in runs" :key="run.name">
      <span class="name">{{ run.name }}</span>
      <div class="run" :class="run.tone">
        <template v-if="run.value !== undefined">
          <i :style="{ width: `${run.value * pxPerUnit}px` }" />
          <b>{{ run.value.toFixed(digits) }} {{ unit }}</b>
        </template>
        <small v-if="run.note">{{ run.note }}</small>
      </div>
    </template>
  </div>
</template>

<style scoped>
.run-bars {
  --bar: 88px;
  --value: 44px;
  --label: 26px;
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 28px 36px;
}

.run-bars.compact {
  --bar: 52px;
  --value: 32px;
  --label: 24px;
  row-gap: 14px;
}

.name {
  font-family: var(--mono);
  font-size: var(--label);
  color: var(--muted);
}

.run {
  display: flex;
  align-items: center;
  gap: 24px;
  height: var(--bar);
}

i {
  height: 100%;
  border-radius: 6px;
  background: var(--text);
}

b {
  font-size: var(--value);
  font-weight: 700;
  white-space: nowrap;
}

small {
  font-size: var(--label);
  color: var(--muted);
}

.muted i {
  background: #8a90a0;
}

.muted b {
  color: var(--muted);
}
</style>
