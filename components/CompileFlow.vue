<script setup lang="ts">
type StageName = 'Python' | 'Dynamo' | 'AOTAutograd' | 'Inductor'
type Line = { tag?: string; text: string }

defineProps<{ focus: StageName }>()

const STAGES: { name: StageName; role: string; example: Line[] }[] = [
  { name: 'Python', role: 'your model code', example: [{ text: 'rms_norm(x, w)' }] },
  {
    name: 'Dynamo',
    role: 'capture graph + guards',
    example: [{ text: 'x.shape == (256, 4096)' }, { text: 'x.stride() == (4096, 1)' }],
  },
  {
    name: 'AOTAutograd',
    role: 'build backward · decompose',
    example: [
      { tag: 'fwd', text: '8 ops · pow mean rsqrt …' },
      { tag: 'bwd', text: '22 ops · mul sum div …' },
    ],
  },
  {
    name: 'Inductor',
    role: 'fuse ops in one graph → Triton',
    example: [
      { tag: 'fwd', text: '8 ops → fused' },
      { tag: 'bwd', text: '22 ops → fused' },
    ],
  },
]
</script>

<template>
  <div class="compile-flow">
    <template v-for="(stage, index) in STAGES" :key="stage.name">
      <span v-if="index > 0" class="arrow" :style="{ gridColumn: 2 * index }">→</span>
      <div class="stage" :class="{ highlight: stage.name === focus }" :style="{ gridColumn: 2 * index + 1 }">
        <h3>{{ stage.name }}</h3>
        <p>{{ stage.role }}</p>
      </div>
      <ul :style="{ gridColumn: 2 * index + 1 }">
        <li v-for="line in stage.example" :key="line.text" :class="{ emphasis: stage.name === focus }"><b v-if="line.tag">{{ line.tag }}</b>{{ line.text }}</li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.compile-flow {
  display: grid;
  grid-template-columns: repeat(7, auto);
  grid-template-rows: auto auto;
  justify-content: space-between;
  align-items: start;
  row-gap: 32px;
  margin-top: 150px;
}

.stage {
  grid-row: 1;
  padding: 24px 28px;
  border: 2px solid #8a90a066;
  border-radius: 12px;
}

.stage.highlight {
  border-color: var(--accent);
}

.arrow {
  grid-row: 1;
  align-self: center;
  font-size: 40px;
  color: var(--muted);
}

h3 {
  margin: 0;
  font-family: var(--mono);
  font-size: 34px;
  font-weight: 600;
}

.stage p {
  margin: 8px 0 0;
  font-size: 24px;
  color: var(--muted);
}

ul {
  grid-row: 2;
  margin: 0;
  padding: 0 28px;
  list-style: none;
  font-family: var(--mono);
  font-variant-ligatures: none;
  font-size: 22px;
  line-height: 1.7;
  color: var(--muted);
}

li b {
  margin-right: 14px;
  padding: 2px 10px;
  border-radius: 6px;
  background: #8a90a033;
  font-weight: 600;
  color: var(--text);
}

li.emphasis {
  color: var(--text);
}

li + li {
  margin-top: 6px;
}
</style>
