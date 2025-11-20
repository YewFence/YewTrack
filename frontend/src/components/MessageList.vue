<template>
  <div ref="container" class="flex-1 overflow-y-auto p-4 space-y-3">
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
import { ref, nextTick } from 'vue';
import type { Message } from '../types/message';
import MessageText from './MessageText.vue';
import MessageMedia from './MessageMedia.vue';
import MessageFile from './MessageFile.vue';
import MessageActions from './MessageActions.vue';

defineProps<{
  messages: Message[];
  currentDeviceId: string;
}>();

const container = ref<HTMLDivElement | null>(null);

async function scrollToBottom() {
  await nextTick();
  const el = container.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

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
