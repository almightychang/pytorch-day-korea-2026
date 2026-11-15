<script setup lang="ts">
import { CONTRACT_LANES, FLOW_CONTRACT } from '../composables/dataFlow'
</script>

<template>
  <div class="input-contract">
    <DataFlow :lanes="CONTRACT_LANES" :nodes="FLOW_CONTRACT" :column-px="560" />
  </div>
</template>

<style scoped>
.input-contract {
  margin-top: 64px;
}
</style>
