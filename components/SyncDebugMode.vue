<script setup lang="ts">
const VERDICTS = [
  { name: 'catches', items: ['.item()   .tolist()   nonzero', 'every call site, with file and line'] },
  { name: 'misses', items: ['async copies (too large, or pageable)', 'where in backward', 'how many ms each call costs'] },
]
</script>

<template>
  <pre class="call">torch.cuda.set_sync_debug_mode(<b>"warn"</b>)</pre>
  <div class="verdicts">
    <section v-for="verdict in VERDICTS" :key="verdict.name" :class="verdict.name">
      <h3>{{ verdict.name }}</h3>
      <p v-for="item in verdict.items" :key="item">{{ item }}</p>
    </section>
  </div>
  <SourceQuote
    class="source"
    site="pytorchDocs"
    title="torch.cuda.set_sync_debug_mode"
    href="https://docs.pytorch.org/docs/stable/generated/torch.cuda.set_sync_debug_mode.html"
  >
    not all synchronizing operations will trigger warning or error
  </SourceQuote>
</template>

<style scoped>
.call {
  margin: 40px 0 0;
  padding: 36px 44px;
  border-radius: 16px;
  background: var(--panel);
  font-family: var(--mono);
  font-size: 40px;
}

.call b {
  font-weight: 400;
  color: var(--compute);
}

.verdicts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  margin-top: 64px;
}

h3 {
  margin: 0 0 20px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

p {
  margin: 0;
  font-size: 34px;
  line-height: 1.6;
  white-space: pre;
}

.misses p {
  color: var(--muted);
}

.source {
  margin-top: 72px;
}
</style>
