<template>
  <video
    :src="src"
    controls
    class="max-w-[50vw] max-h-[50vh] rounded-lg"
  />
</template>

<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>
