<template>
  <div class="flex-1 overflow-y-auto p-4 space-y-3">
    <div
      v-for="message in messages"
      :key="message.id"
      :class="[
        'flex',
        message.sender === currentDeviceId ? 'justify-end' : 'justify-start',
      ]"
    >
      <div
        :class="[
          'max-w-[70%] rounded-2xl px-4 py-2 break-words',
          message.sender === currentDeviceId
            ? 'bg-blue-500 text-white rounded-br-sm'
            : 'bg-gray-200 text-gray-800 rounded-bl-sm',
        ]"
      >
        <!-- 文本消息 -->
        <div v-if="message.type === 'text'" class="text-sm">
          {{ message.text }}
        </div>

        <!-- 文件消息 -->
        <div v-else-if="message.type === 'file'" class="space-y-2">
          <!-- 图片预览 -->
          <img
            v-if="isImage(message.fileName)"
            :src="`http://localhost:3000/api/files/${message.fileName}`"
            :alt="message.text"
            class="max-w-full rounded-lg"
            loading="lazy"
          />

          <!-- 视频预览 -->
          <video
            v-else-if="isVideo(message.fileName)"
            :src="`http://localhost:3000/api/files/${message.fileName}`"
            controls
            class="max-w-full rounded-lg"
          />

          <!-- 其他文件 -->
          <a
            v-else
            :href="`http://localhost:3000/api/download/${message.id}`"
            class="flex items-center space-x-2 text-sm hover:underline"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>{{ message.text }}</span>
          </a>
        </div>

        <!-- 时间戳 -->
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../types/message';

const props = defineProps<{
  messages: Message[];
  currentDeviceId: string;
}>();

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
