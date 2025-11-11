import express from 'express';
import { Request, Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World from Express with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// 模拟一个消息列表，暂时存储在内存中
let messages: { id: number; text: string; sender: string }[] = [
  { id: 1, text: 'Hello from server!', sender: 'Server' },
  { id: 2, text: 'How are you?', sender: 'Server' },
];

// 定义一个 GET /api/messages 路由，返回消息列表
app.get('/api/messages', (req: Request, res: Response) => {
  res.json(messages); // 使用 res.json() 发送 JSON 格式的响应
});
