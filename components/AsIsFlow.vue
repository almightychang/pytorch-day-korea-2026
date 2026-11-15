<script setup lang="ts">
import { AS_IS } from '../composables/dataFlow'
</script>

<template>
  <div class="as-is-flow">
    <DataFlow :lanes="AS_IS.lanes" :nodes="AS_IS.nodes" :column-px="AS_IS.columnPx" />
  </div>
</template>

<style scoped>
.as-is-flow {
  margin-top: 190px;
}
</style>
