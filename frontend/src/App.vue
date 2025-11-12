<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 顶部栏 -->
    <header class="bg-blue-500 text-white p-4 shadow-md flex justify-between items-center">
      <h1 class="text-xl font-semibold">YewTrack 消息传输</h1>
      <button
        @click="handleRefresh"
        class="bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors"
        title="刷新消息"
      >
        <svg
          class="w-5 h-5"
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
        <span>刷新</span>
      </button>
    </header>

    <!-- 消息列表 -->
    <MessageList
      :messages="messages"
      :currentDeviceId="deviceId"
      @delete-message="handleDeleteMessage"
    />

    <!-- 底部输入栏 -->
    <InputBar @sendMessage="sendTextMessage" @uploadFiles="uploadFiles" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MessageList from './components/MessageList.vue';
import InputBar from './components/InputBar.vue';
import type { Message } from './types/message';
import { getDeviceId } from './utils/deviceId';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const messages = ref<Message[]>([]);
const deviceId = getDeviceId();
const isRefreshing = ref(false);

// 获取消息列表
async function fetchMessages() {
  try {
    const response = await fetch(`${API_BASE}/api/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    messages.value = await response.json();
  } catch (error) {
    console.error('获取消息失败:', error);
  }
}

// 手动刷新
async function handleRefresh() {
  isRefreshing.value = true;
  await fetchMessages();
  setTimeout(() => {
    isRefreshing.value = false;
  }, 500);
}

// 发送文本消息
async function sendTextMessage(text: string) {
  try {
    const response = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        sender: deviceId,
      }),
    });

    if (!response.ok) throw new Error('Failed to send message');

    const newMessage: Message = await response.json();
    messages.value.push(newMessage);
  } catch (error) {
    console.error('发送消息失败:', error);
    alert('发送消息失败，请重试');
  }
}

// 上传文件
async function uploadFiles(files: File[]) {
  for (const file of files) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender', deviceId);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      const newMessage: Message = await response.json();
      messages.value.push(newMessage);
    } catch (error) {
      console.error('上传文件失败:', error);
      alert(`上传文件 ${file.name} 失败，请重试`);
    }
  }
}

// 删除消息
async function handleDeleteMessage(messageId: string) {
  if (!confirm('确定要删除这条消息吗？')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete message');

    // 从本地列表中移除
    messages.value = messages.value.filter((m) => m.id !== messageId);
  } catch (error) {
    console.error('删除消息失败:', error);
    alert('删除消息失败，请重试');
  }
}

// 生命周期钩子
onMounted(() => {
  fetchMessages();
});
</script>
