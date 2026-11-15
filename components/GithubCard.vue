<script setup lang="ts">
import { SITES } from '../composables/siteLogos'

type State = 'merged' | 'closed'

defineProps<{ repo: string; number: number; title: string; state: State; meta: string }>()

const STATE_ICON: Record<State, string> = {
  merged:
    'M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z',
  closed:
    'M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z',
}
</script>

<template>
  <article class="github-card">
    <header>
      <svg :viewBox="SITES.github.viewBox" class="mark"><path :d="SITES.github.glyph" /></svg>
      <span class="repo">{{ repo }}</span>
      <span class="number">#{{ number }}</span>
      <span class="state">
        <svg viewBox="0 0 16 16"><path :d="STATE_ICON[state]" /></svg>
        {{ state }}
      </span>
    </header>
    <h3>{{ title }}</h3>
    <p class="meta">{{ meta }}</p>
    <div class="body"><slot /></div>
  </article>
</template>

<style scoped>
.github-card {
  padding: 36px 40px;
  border: 2px solid #ffffff14;
  border-radius: 16px;
  background: var(--panel);
}

header {
  display: flex;
  align-items: center;
  gap: 14px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

svg {
  fill: currentColor;
}

.mark {
  width: 32px;
  height: 32px;
  color: var(--text);
}

.number {
  color: var(--text);
}

.state {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 999px;
  background: color-mix(in srgb, #8957e5 35%, transparent);
  font-family: inherit;
  font-size: 20px;
  text-transform: capitalize;
  color: var(--text);
}

.state svg {
  width: 20px;
  height: 20px;
}

h3 {
  margin: 28px 0 10px;
  font-size: 34px;
  line-height: 1.3;
}

.meta {
  margin: 0 0 24px;
  font-family: var(--mono);
  font-size: 20px;
  color: var(--muted);
}

.body {
  font-size: 26px;
  line-height: 1.5;
  color: var(--muted);
}
</style>
