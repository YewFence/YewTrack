<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 顶部栏 -->
    <header class="bg-blue-500 text-white p-4 shadow-md">
      <h1 class="text-xl font-semibold">YewTrack 消息传输</h1>
    </header>

    <!-- 消息列表 -->
    <MessageList :messages="messages" :currentDeviceId="deviceId" />

    <!-- 底部输入栏 -->
    <InputBar @sendMessage="sendTextMessage" @uploadFiles="uploadFiles" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import MessageList from './components/MessageList.vue';
import InputBar from './components/InputBar.vue';
import type { Message } from './types/message';
import { getDeviceId } from './utils/deviceId';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const messages = ref<Message[]>([]);
const deviceId = getDeviceId();
let pollingInterval: number | null = null;

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

// 生命周期钩子
onMounted(() => {
  fetchMessages();
  // 每 3 秒轮询一次新消息
  pollingInterval = window.setInterval(fetchMessages, 3000);
});

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>
