<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const SEPARATE = [
  { reads: ['x', 'w'], op: 'mul', write: 't1' },
  { reads: ['t1', 'b'], op: 'add', write: 't2' },
  { reads: ['t2'], op: 'sigmoid', write: 'y' },
]
const FUSED = { reads: ['x', 'w', 'b'], ops: SEPARATE.map((kernel) => kernel.op), write: 'y' }

const separateReads = SEPARATE.reduce((sum, kernel) => sum + kernel.reads.length, 0)
const separateOps = separateReads + SEPARATE.length
const fusedOps = FUSED.reads.length + 1
</script>

<template>
  <div class="intermediate-tensors">
    <section>
      <h3>{{ SEPARATE.length }} kernels</h3>
      <div v-for="kernel in SEPARATE" :key="kernel.op" class="row">
        <span class="reads"><span v-for="name in kernel.reads" :key="name" class="memory">{{ name }}</span></span>
        <span class="arrow">→</span>
        <span class="op">{{ kernel.op }}</span>
        <span class="arrow">→</span>
        <span class="memory">{{ kernel.write }}</span>
      </div>
      <p class="count">
        <b>{{ separateOps }}</b> memory operations
        <span>{{ separateReads }} reads + {{ SEPARATE.length }} writes</span>
      </p>
    </section>

    <section>
      <h3>1 fused kernel</h3>
      <div class="row">
        <span class="reads"><span v-for="name in FUSED.reads" :key="name" class="memory">{{ name }}</span></span>
        <span class="arrow">→</span>
        <span class="op fused">{{ FUSED.ops.join(' → ') }}<small>intermediates stay in registers</small></span>
        <span class="arrow">→</span>
        <span class="memory">{{ FUSED.write }}</span>
      </div>
      <p class="count">
        <b>{{ fusedOps }}</b> memory operations
        <span>{{ FUSED.reads.length }} reads + 1 write</span>
      </p>
    </section>
  </div>

  <p class="foot">
    <span><i class="memory-key" />tensor in global memory <i class="op-key" />kernel</span>
    <IllustrativeBadge />
  </p>
  <SourceNote
    site="pytorch"
    title="Why Is PyTorch Compile So Fast: Kernel Fusion"
    detail="example and counts"
    href="https://pytorch.org/blog/why-is-pytorch-compile-so-fast-kernel-fusion/"
  />
</template>

<style scoped>
.intermediate-tensors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 96px;
  margin-top: 56px;
}

h3 {
  margin: 0 0 28px;
  font-size: 30px;
  font-weight: 600;
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.reads {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 232px;
}

.memory,
.op {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 24px;
}

.memory {
  width: 72px;
  border: 3px dashed #8a90a099;
  color: var(--text);
}

.op {
  width: 150px;
  background: v-bind('laneColour.kernel');
  color: var(--bg);
}

.op.fused {
  width: 330px;
  height: 92px;
  flex-direction: column;
  gap: 4px;
}

.op small {
  font-family: Pretendard, system-ui, sans-serif;
  font-size: 17px;
}

.arrow {
  font-size: 26px;
  color: var(--muted);
}

.count {
  margin: 28px 0 0;
  font-size: 28px;
  color: var(--text);
}

.count b {
  font-size: 56px;
  font-weight: 800;
}

.count span {
  display: block;
  font-size: 22px;
  color: var(--muted);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 44px 0 0;
  font-size: 22px;
  color: var(--muted);
}

.foot span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.memory-key,
.op-key {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.memory-key {
  border: 2px dashed #8a90a099;
}

.op-key {
  margin-left: 26px;
  background: v-bind('laneColour.kernel');
}
</style>
