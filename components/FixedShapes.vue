<script setup lang="ts">
import { THEMES } from '../composables/themes'

const FIXED = 256
const PER_BATCH = [196, 256, 225, 144]
const CASES = [
  { title: 'dynamic', values: PER_BATCH },
  { title: 'static', values: PER_BATCH.map(() => FIXED) },
]

const BAR_PX_PER_UNIT = 1
const MADE_STATIC = [
  { name: 'max_seqlen', from: 'per-batch maximum', to: 'config value' },
  { name: 'tensor stride', from: 'view of a larger tensor', to: 'contiguous' },
]

const compiles = (values: number[]) =>
  values.reduce<{ from: number; rows: number }[]>((runs, value, row) => {
    const last = runs.at(-1)
    if (last && values[last.from] === value) last.rows += 1
    else runs.push({ from: row, rows: 1 })
    return runs
  }, [])
</script>

<template>
  <div class="fixed-shapes">
    <section v-for="example in CASES" :key="example.title">
      <h3>{{ example.title }}</h3>
      <div class="flow">
        <template v-for="(value, row) in example.values" :key="row">
          <span class="shape" :style="{ gridRow: row + 1 }">
            <em :style="{ width: `${value * BAR_PX_PER_UNIT}px` }" />{{ value }}
          </span>
          <i :style="{ gridRow: row + 1 }" />
        </template>
        <b v-for="run in compiles(example.values)" :key="run.from" :style="{ gridRow: `${run.from + 1} / span ${run.rows}` }">
          compile
        </b>
      </div>
    </section>
  </div>
  <p class="foot">
    <dl>
      <div v-for="variable in MADE_STATIC" :key="variable.name">
        <dt>{{ variable.name }}</dt>
        <dd>{{ variable.from }} → {{ variable.to }}</dd>
      </div>
    </dl>
    <IllustrativeBadge />
  </p>
</template>

<style scoped>
.fixed-shapes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 120px;
  margin-top: 56px;
}

h3 {
  margin: 0 0 24px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  color: var(--muted);
}

.flow {
  display: grid;
  grid-template-columns: 330px 1fr 200px;
  grid-auto-rows: 72px;
  align-items: center;
  row-gap: 16px;
}

.shape {
  grid-column: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

em {
  height: 44px;
  border-radius: 4px;
  background: #8a90a0;
}

i {
  grid-column: 2;
  position: relative;
  margin: 0 24px;
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

b {
  grid-column: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 10px;
  background: color-mix(in srgb, v-bind('THEMES.kernel.colour') 30%, transparent);
  font-size: 26px;
  font-weight: 600;
}

.foot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin: 48px 0 0;
  font-size: 22px;
  color: var(--muted);
}

dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

dl div {
  display: flex;
}

dt {
  width: 220px;
  font-family: var(--mono);
  color: var(--text);
}

dd {
  margin: 0;
}
</style>
