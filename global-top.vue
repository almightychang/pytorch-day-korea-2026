<template>
  <div class="page-number">{{ $nav.currentPage }} / {{ $nav.total }}</div>
</template>

<style scoped>
.page-number {
  position: absolute;
  right: 64px;
  bottom: 40px;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}
</style>
