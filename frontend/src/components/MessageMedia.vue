<template>
  <div class="space-y-2">
    <div class="relative">
      <!-- 占位符 (上传中 或 预览生成中) -->
      <div
        v-if="shouldShowPlaceholder"
        class="w-64 h-48 bg-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 space-y-2"
      >
        <svg class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm font-medium">Loading...</span>
      </div>

      <!-- 实际预览 -->
      <template v-else>
        <ImagePreview v-if="isImage" :src="previewUrl" :alt="message.text" />
        <VideoPreview v-else-if="isVideo" :src="previewUrl" />
      </template>
    </div>

    <!-- 进度条 -->
    <div v-if="isMedia" class="w-full max-w-[200px] h-1.5 flex space-x-1">
      <div 
        class="flex-1 rounded-full transition-colors duration-300"
        :class="message.previewStatus !== 'uploading' ? 'bg-green-500' : 'bg-gray-300'"
      ></div>
      <div 
        class="flex-1 rounded-full transition-colors duration-300"
        :class="message.previewStatus === 'completed' ? 'bg-green-500' : 'bg-gray-300'"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '../types/message';
import { buildApiUrl } from '../utils/api';
import ImagePreview from './ImagePreview.vue';
import VideoPreview from './VideoPreview.vue';
import { computed } from 'vue';

const props = defineProps<{ message: Message }>();

function getExt(name?: string) {
  return (name || '').toLowerCase().split('.').pop() || '';
}

const isImage = computed(() => ['jpg','jpeg','png','gif','webp','svg'].includes(getExt(props.message.fileName)) );
const isVideo = computed(() => ['mp4','webm','ogg','mov'].includes(getExt(props.message.fileName)) );
const isMedia = computed(() => isImage.value || isVideo.value );

const previewUrl = computed(() => {
  return props.message.previewFileName
    ? buildApiUrl(`/api/files/preview/${props.message.previewFileName}`)
    : buildApiUrl(`/api/files/${props.message.fileName}`);
});

const shouldShowPlaceholder = computed(() => {
  return isMedia.value && !!props.message.previewStatus && props.message.previewStatus !== 'completed';
});
</script>
