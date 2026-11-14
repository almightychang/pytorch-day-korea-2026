<template>
  <div class="page">
    <p v-if="$frontmatter.eyebrow" class="eyebrow">{{ $frontmatter.eyebrow }}</p>
    <slot />
  </div>
</template>
