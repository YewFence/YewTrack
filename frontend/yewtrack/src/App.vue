<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 定义一个 TypeScript 接口来描述消息对象的结构
// 这为我们的数据提供了类型安全
interface Message {
  id: number;
  text: string;
  sender: string;
}

// 创建一个响应式引用来存储消息数组
// ref<Message[]>([]) 表示这是一个 Message 类型对象的数组
const messages = ref<Message[]>([]);

// onMounted 是一个生命周期钩子，在组件被挂载到 DOM 后执行
onMounted(async () => {
  try {
    // 使用 fetch 从后端 API 获取消息
    const response = await fetch('http://localhost:3000/api/messages');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    // 将获取到的 JSON 数据赋值给 messages ref
    // .value 是访问 ref 内部值的唯一方式
    messages.value = await response.json();
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
});
</script>

<template>
  <div class="chat-container">
    <h1>Message Board</h1>
    <ul>
      <!-- 使用 v-for 循环渲染 messages 数组 -->
      <li v-for="message in messages" :key="message.id">
        <strong>{{ message.sender }}:</strong> {{ message.text }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-family: sans-serif;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

li:last-child {
  border-bottom: none;
}
</style>