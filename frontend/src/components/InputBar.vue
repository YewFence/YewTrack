<template>
  <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0">
    <!-- 已选文件预览 -->
    <div v-if="selectedFiles.length > 0" class="mb-3 flex flex-wrap gap-2">
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
      >
        <span class="truncate max-w-[200px]">{{ file.name }}</span>
        <button
          @click="removeFile(index)"
          class="text-gray-500 hover:text-red-500"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex items-end space-x-2">
      <!-- 文件上传按钮 -->
      <label
        class="flex-shrink-0 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-3 transition-colors"
      >
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept="*/*"
          multiple
          @change="handleFileSelect"
        />
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </label>

      <!-- 文本输入框 -->
      <textarea
        v-model="inputText"
        ref="textareaRef"
        placeholder="输入消息..."
        class="flex-1 resize-none border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
        rows="1"
        @keydown.enter.exact.prevent="handleSend"
        @input="autoResize"
      />

      <!-- 发送按钮 -->
      <button
        @click="handleSend"
        :disabled="!inputText.trim() && selectedFiles.length === 0"
        :class="[
          'flex-shrink-0 rounded-full p-3 transition-colors',
          inputText.trim() || selectedFiles.length > 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
        ]"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

const emit = defineEmits<{
  sendMessage: [text: string];
  uploadFiles: [files: File[]];
}>();

const inputText = ref('');
const selectedFiles = ref<File[]>([]);
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

function autoResize() {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)];
  }
  // 重置 input 以允许选择相同文件
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

function handleSend() {
  const text = inputText.value.trim();

  // 如果有文件，优先上传文件
  if (selectedFiles.value.length > 0) {
    emit('uploadFiles', [...selectedFiles.value]);
    selectedFiles.value = [];
  }

  // 如果有文本，发送文本消息
  if (text) {
    emit('sendMessage', text);
    inputText.value = '';
  }

  // 重置 textarea 高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto';
    }
  });
}
</script>
