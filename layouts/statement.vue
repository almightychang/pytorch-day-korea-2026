<template>
  <div class="page statement">
    <p v-if="$frontmatter.eyebrow" class="eyebrow">{{ $frontmatter.eyebrow }}</p>
    <slot />
  </div>
</template>
