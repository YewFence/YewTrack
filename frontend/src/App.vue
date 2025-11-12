<template>
  <h1 class="text-3xl font-bold underline bg-blue-500 text-white">
    Hello world!
  </h1>
  <div class="chat-container">
    <h1>Message Board</h1>
    <ul>
      <li v-for="message in messages" :key="message.id">
        <strong>{{ message.sender }}:</strong> {{ message.text }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Message {
  id: number;
  text: string;
  sender: string;
}

const messages = ref<Message[]>([]);

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/messages');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    messages.value = await response.json();
  } catch (error) {
    console.error('Failed to fetch messages:', error);
  }
});
</script>

<style scoped>
</style>
