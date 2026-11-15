<script setup lang="ts">
import { THEMES, type ThemeKey } from '../composables/themes'

const PAIRS: { declared: string; holds: string; executed: string; theme: ThemeKey }[] = [
  { declared: 'Input Contract', holds: 'precomputed tensors', executed: 'H2D Prefetch', theme: 'host' },
  { declared: 'Route Plan', holds: 'rank assignment', executed: 'Batch Routing', theme: 'rank' },
  { declared: 'Fixed Shapes', holds: 'compile-time constants', executed: 'Compiled Kernel', theme: 'kernel' },
]
const tint = (theme: ThemeKey) => ({ background: `color-mix(in srgb, ${THEMES[theme].colour} 30%, transparent)` })
</script>

<template>
  <div class="declare-execute">
    <span class="side">host</span>
    <span />
    <span class="side">device</span>
    <template v-for="pair in PAIRS" :key="pair.declared">
      <div class="declared">
        <b>{{ pair.declared }}</b>
        <span>{{ pair.holds }}</span>
      </div>
      <i />
      <div class="executed" :style="tint(pair.theme)">{{ pair.executed }}</div>
    </template>
  </div>
</template>

<style scoped>
.declare-execute {
  display: grid;
  grid-template-columns: 520px 280px 380px;
  justify-content: center;
  align-items: center;
  gap: 24px 32px;
  margin-top: 64px;
}

.side {
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.declared,
.executed {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 120px;
  border-radius: 12px;
  font-size: 30px;
  font-weight: 600;
}

.declared {
  gap: 8px;
  padding: 0 32px;
  border: 3px solid #8a90a0;
}

.declared span {
  font-family: var(--mono);
  font-size: 22px;
  font-weight: 400;
  color: var(--muted);
}

.executed {
  align-items: center;
}

i {
  position: relative;
  border-top: 3px solid var(--muted);
}

i::after {
  content: '';
  position: absolute;
  right: -2px;
  top: -9px;
  border: 8px solid transparent;
  border-left: 14px solid var(--muted);
  border-right: 0;
}
</style>
