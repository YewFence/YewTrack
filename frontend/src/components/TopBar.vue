<template>
  <header
    class="bg-blue-500 text-white shadow-md flex justify-between items-center px-3 py-2 sm:px-4 sm:py-4 flex-shrink-0"
  >
    <h1 class="text-base sm:text-xl font-semibold">YewTrack 消息传输</h1>
    <button
      @click="handleRefresh"
      class="bg-blue-600 hover:bg-blue-700 rounded-lg px-2 py-1 sm:px-4 sm:py-2 flex items-center space-x-1 sm:space-x-2 transition-colors text-sm sm:text-base"
      title="刷新消息"
    >
      <svg
        class="w-4 h-4 sm:w-5 sm:h-5"
        :class="{ 'animate-spin': isRefreshing }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span class="hidden sm:inline">刷新</span>
    </button>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  refresh: [];
}>();

const isRefreshing = ref(false);

async function handleRefresh() {
  isRefreshing.value = true;
  emit('refresh');
  setTimeout(() => {
    isRefreshing.value = false;
  }, 500);
}
</script>
