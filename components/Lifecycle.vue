<script setup lang="ts">
const STAGES = [
  { name: 'Data Collection', detail: 'Sim / real teleop' },
  { name: 'Training', detail: 'Fine-tuning' },
  { name: 'Rollout', detail: 'Real-time inference' },
]
</script>

<template>
  <div class="lifecycle">
    <template v-for="(stage, index) in STAGES" :key="stage.name">
      <div v-if="index > 0" class="arrow">→</div>
      <div class="stage">
        {{ stage.name }}
        <small>{{ stage.detail }}</small>
      </div>
    </template>
  </div>
</template>

<style scoped>
.lifecycle {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-top: 190px;
}

.stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 240px;
  border-radius: 16px;
  background: var(--panel);
  font-size: 46px;
  font-weight: 800;
  white-space: nowrap;
}

.stage small {
  margin-top: 8px;
  font-family: var(--mono);
  font-size: 28px;
  font-weight: 400;
  color: var(--muted);
}

.arrow {
  font-size: 56px;
  color: var(--muted);
}
</style>
