<template>
  <div class="flex flex-col h-screen bg-gray-50">
    <!-- 顶部栏 -->
    <TopBar @refresh="handleRefresh" />

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
import { ref, onMounted, onUnmounted } from 'vue';
import TopBar from './components/TopBar.vue';
import MessageList from './components/MessageList.vue';
import InputBar from './components/InputBar.vue';
import type { Message } from './types/message';
import { getDeviceId } from './utils/deviceId';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const messages = ref<Message[]>([]);
const deviceId = getDeviceId();
let socket: WebSocket | null = null;

function getWsUrl() {
  if (API_BASE) {
    return API_BASE.replace(/^http/, 'ws');
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
}

function setupWebSocket() {
  const wsUrl = getWsUrl();
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        const newMessage = data.payload;
        // 避免重复添加（如果是自己发送的，可能已经添加过了）
        // 如果本地有 'uploading' 状态的同名消息（这里简化处理，实际应该用 ID 匹配，但上传前没有 ID）
        // 更好的方式是：上传成功后，用真实消息替换临时消息
        console.log('new message id:', newMessage.id);
        console.log(messages.value);
        const existingIndex = messages.value.findIndex((m) => m.id === newMessage.id);
        if (existingIndex === -1) {
          console.log('Adding new message', newMessage, 'from WebSocket');
          messages.value.push(newMessage);
        }
      } else if (data.type === 'update_message') {
        const updatedMessage = data.payload;
        const index = messages.value.findIndex((m) => m.id === updatedMessage.id);
        if (index !== -1) {
          // 消息在本地存在，更新它
          messages.value[index] = updatedMessage;
        } else {
          // 消息不存在（其他设备上传的），添加它
          messages.value.push(updatedMessage);
        }
      } else if (data.type === 'delete_message') {
        const deletedId = data.payload;
        messages.value = messages.value.filter((m) => m.id !== deletedId);
      }
    } catch (error) {
      console.error('WebSocket message parse error:', error);
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected, reconnecting in 3s...');
    setTimeout(setupWebSocket, 3000);
  };
}

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
  await fetchMessages();
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
    // 创建临时消息
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage: Message = {
      id: tempId,
      text: file.name,
      sender: deviceId,
      timestamp: new Date().toISOString(),
      type: 'file',
      fileName: file.name, // 临时显示用
      previewStatus: 'uploading',
    };
    messages.value.push(tempMessage);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sender', deviceId);

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload file');

      // 等待响应成功后，移除临时消息
      await response.json();
      
      // 移除临时消息，等待 WebSocket 广播真实消息
      messages.value = messages.value.filter(m => m.id !== tempId);
      // 注意：不在这里添加消息，等 WebSocket 的 new_message 事件
    } catch (error) {
      console.error('上传文件失败:', error);
      alert(`上传文件 ${file.name} 失败，请重试`);
      // 移除失败的临时消息
      messages.value = messages.value.filter(m => m.id !== tempId);
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
  setupWebSocket();
});

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});
</script>
