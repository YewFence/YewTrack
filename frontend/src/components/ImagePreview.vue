<template>
  <img
    :src="src"
    :alt="alt"
    class="max-w-[50vw] max-h-[50vh] object-contain rounded-lg"
    loading="lazy"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string;
  alt: string;
}>();
</script>
