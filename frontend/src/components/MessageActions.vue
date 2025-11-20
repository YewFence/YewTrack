<template>
  <div class="flex flex-col space-y-0.5">
    <!-- 删除按钮 -->
    <button
      @click="$emit('delete-message', message.id)"
      class="md:opacity-0 md:group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-red-100 text-red-500"
      title="删除消息"
    >
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- 下载按钮 (仅对图片和视频显示) -->
    <button
      v-if="isMedia"
      @click="downloadFile"
      :disabled="message.previewStatus === 'uploading'"
      :class="[
        'md:opacity-0 md:group-hover:opacity-100 transition-opacity p-0.5 rounded-full',
        message.previewStatus === 'uploading' 
          ? 'text-gray-300 cursor-not-allowed' 
          : 'hover:bg-blue-100 text-blue-500'
      ]"
      title="下载文件"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v12m0 0l-4-4m4 4l4-4" />
        <line x1="4" y1="20" x2="20" y2="20" stroke-linecap="round" stroke-width="2" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '../types/message';
import { buildApiUrl } from '../utils/api';

const props = defineProps<{ message: Message }>();

function getExt(name?: string) {
  return (name || '').toLowerCase().split('.').pop() || '';
}
const isImage = ['jpg','jpeg','png','gif','webp','svg'].includes(getExt(props.message.fileName));
const isVideo = ['mp4','webm','ogg','mov'].includes(getExt(props.message.fileName));
const isMedia = (props.message.type === 'file') && (isImage || isVideo);

async function downloadFile() {
  try {
    const ext = props.message.fileName?.split('.').pop() || '';
    const file_type = isImage ? 'image' : (isVideo ? 'video' : 'file');

    const date = new Date(props.message.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const fileName = `${file_type}_${year}.${month}.${day}_${hours}-${minutes}-${seconds}.${ext}`;

    const response = await fetch(buildApiUrl(`/api/download/${props.message.id}`));
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('下载文件失败:', error);
  }
}
</script>
