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
      <div class="flex items-start space-x-2 group">
        <div
          :class="[
            'flex-1 max-w-[70%] rounded-2xl px-4 py-2 break-words',
            message.sender === currentDeviceId
              ? 'bg-blue-500 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-800 rounded-bl-sm',
          ]"
        >
          <!-- 文本消息 -->
          <div v-if="message.type === 'text'" class="text-sm relative" @click="copyText($event, message.id)">
            {{ message.text }}
            <!-- 复制成功提示 -->
            <transition
              enter-active-class="transition-opacity duration-300 ease-in-out"
              leave-active-class="transition-opacity duration-300 ease-in-out"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <div
                v-if="copiedMessageId === message.id"
                class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 shadow-lg"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </transition>
          </div>

          <!-- 文件消息 -->
          <div v-else-if="message.type === 'file'" class="space-y-2">
            <!-- 图片预览 -->
            <img
              v-if="isImage(message.fileName)"
              :src="buildApiUrl(`/api/files/${message.fileName}`)"
              :alt="message.text"
              class="max-w-full rounded-lg"
              loading="lazy"
            />

            <!-- 视频预览 -->
            <video
              v-else-if="isVideo(message.fileName)"
              :src="buildApiUrl(`/api/files/${message.fileName}`)"
              controls
              class="max-w-full rounded-lg"
            />

            <!-- 其他文件 -->
            <a
              v-else
              :href="buildApiUrl(`/api/download/${message.id}`)"
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

        <!-- 删除按钮 -->
        <button
          @click="$emit('delete-message', message.id)"
          class="md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 text-red-500"
          title="删除消息"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Message } from '../types/message';
import { buildApiUrl } from '../utils/api';

defineProps<{
  messages: Message[];
  currentDeviceId: string;
}>();

const copiedMessageId = ref<string | null>(null);

function copyText(event: MouseEvent, messageId: string) {
  const target = event.target as HTMLElement;
  if (target.tagName.toLowerCase() === 'div') {
    const text = target.textContent || '';
    navigator.clipboard.writeText(text).then(() => {
      copiedMessageId.value = messageId;
      setTimeout(() => {
        copiedMessageId.value = null;
      }, 2000);
    });
  }
}

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
