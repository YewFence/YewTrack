import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

// 1. 使用 express.json() 中间件来解析所有传入的 JSON 请求体
app.use(express.json());

// 模拟一个消息列表，暂时存储在内存中
let messages: { id: number; text: string; sender: string }[] = [
  { id: 1, text: 'Hello from server!', sender: 'Server' },
  { id: 2, text: 'How are you?', sender: 'Server' },
];

// 定义一个根路由
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World from Express with TypeScript!');
});

// 定义 GET /api/messages 路由，返回消息列表
app.get('/api/messages', (req: Request, res: Response) => {
  res.json(messages);
});

// 2. 定义 POST /api/messages 路由，用于创建新消息
app.post('/api/messages', (req: Request, res: Response) => {
  // 从请求体中获取新消息的内容
  const newMessage = req.body;
  console.log('Received new message:', newMessage);

  // 为新消息创建一个 ID
  newMessage.id = messages.length + 1;

  // 将新消息添加到数组中
  messages.push(newMessage);

  // 返回成功状态码 201 (Created) 和新创建的消息
  res.status(201).json(newMessage);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});