<template>
  <div class="text-sm relative" @click="copyText">
    <pre
      class="whitespace-pre-wrap break-words font-inherit leading-normal" 
      v-html="renderedHtml"
    ></pre>
    <transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="copied"
        class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 shadow-lg"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <span>已复制</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Message } from '../types/message';

const props = defineProps<{ message: Message }>();
const copied = ref(false);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function linkify(str: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let result = '';
  let lastIndex = 0;
  for (const match of str.matchAll(urlRegex)) {
    const url = match[0];
    const index = match.index || 0;
    const before = str.slice(lastIndex, index);
    result += escapeHtml(before);
    const safeUrl = escapeHtml(url);
    result += `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="underline text-blue-200 break-all">${safeUrl}</a>`;
    lastIndex = index + url.length;
  }
  result += escapeHtml(str.slice(lastIndex));
  return result;
}

const renderedHtml = computed(() => linkify(props.message.text || ''));

function copyText(event: MouseEvent) {
  // 只在点击容器空白区域复制，点击链接不触发
  const target = event.target as HTMLElement;
  if (target.tagName.toLowerCase() === 'a') return;
  const text = props.message.text || '';
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  });
}
</script>
