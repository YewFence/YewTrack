<template>
  <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-3 relative">
    <!-- 新消息提示按钮 -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 translate-y-2"
      leave-to-class="opacity-0 translate-y-2"
    >
      <button
        v-if="unreadCount > 0"
        @click="scrollToBottom"
        class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 z-10 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span>{{ unreadCount }} 条新消息</span>
      </button>
    </transition>

    <div
      v-for="message in messages"
      :key="message.id"
      :class="[
        'flex',
        message.sender === currentDeviceId ? 'justify-end' : 'justify-start',
      ]"
    >
      <div class="flex items-start space-x-2 group max-w-[70%]">
        <div
          :class="[
            'rounded-2xl px-4 py-2 break-words',
            message.sender === currentDeviceId
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm',
          ]"
        >
          <MessageText v-if="message.type === 'text'" :message="message" />
          <MessageMedia
            v-else-if="message.type === 'file' && isMedia(message.fileName)"
            :message="message"
          />
          <MessageFile
            v-else-if="message.type === 'file'"
            :message="message"
          />

          <div
            :class="[
              'text-xs mt-1',
              message.sender === currentDeviceId
                ? 'text-blue-100'
                : 'text-gray-500',
            ]"
          >
            {{ formatTime(message.timestamp) }}
          </div>
        </div>

        <MessageActions
          :message="message"
          @delete-message="$emit('delete-message', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import type { Message } from '../types/message';
import MessageText from './MessageText.vue';
import MessageMedia from './MessageMedia.vue';
import MessageFile from './MessageFile.vue';
import MessageActions from './MessageActions.vue';

const props = defineProps<{
  messages: Message[];
  currentDeviceId: string;
}>();

const container = ref<HTMLDivElement | null>(null);
const unreadCount = ref(0);
const isInitialLoad = ref(true);

function isAtBottom(): boolean {
  const el = container.value;
  if (!el) return true;
  const threshold = 100; // 距离底部100px内认为在底部
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
}

async function scrollToBottom() {
  await nextTick();
  const el = container.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
  unreadCount.value = 0; // 滚动到底部时清零未读数
}

function handleScroll() {
  // 滚动到底部时清零未读数
  if (isAtBottom()) {
    unreadCount.value = 0;
  }
}

// 监听消息变化，智能滚动
watch(() => props.messages.length, (newLength, oldLength) => {
  if (newLength > oldLength) {
    // 有新消息
    if (isInitialLoad.value) {
      // 初次加载，直接滚动到底部
      isInitialLoad.value = false;
      scrollToBottom();
    } else {
      // 后续消息，智能判断
      nextTick(() => {
        if (isAtBottom()) {
          // 用户在底部，自动滚动
          scrollToBottom();
        } else {
          // 用户不在底部，增加未读计数
          const newCount = newLength - oldLength;
          unreadCount.value += newCount;
        }
      });
    }
  }
});

onMounted(() => {
  const el = container.value;
  if (el) {
    el.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  const el = container.value;
  if (el) {
    el.removeEventListener('scroll', handleScroll);
  }
});

defineExpose({ scrollToBottom });

function isImage(fileName?: string): boolean {
  if (!fileName) return false;
  const ext = fileName.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '');
}

function isVideo(fileName?: string): boolean {
  if (!fileName) return false;
  const ext = fileName.toLowerCase().split('.').pop();
  return ['mp4', 'webm', 'ogg', 'mov'].includes(ext || '');
}

function isMedia(fileName?: string): boolean {
  return isImage(fileName) || isVideo(fileName);
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 今天的消息只显示时间
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 其他显示日期和时间
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

</script>
