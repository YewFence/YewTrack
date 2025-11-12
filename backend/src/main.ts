import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Message } from './models/message';
import cors from 'cors';

const app = express();
const port = 3000;

// 使用 cors 中间件，允许所有跨域请求
// 在开发阶段，这很方便。在生产环境中，你可能需要配置具体的源。
app.use(cors());
// 使用 express.json() 中间件来解析所有传入的 JSON 请求体
app.use(express.json());

// 模拟一个消息列表，暂时存储在内存中 (已更新，加入 sender 和 timestamp)
let messages: Message[] = [
  { id: nanoid(), text: '欢迎来到多端同步聊天室！', type: 'text', timestamp: new Date().toISOString(), sender: '系统消息' },
];

// 定义 GET /api/messages 路由，返回消息列表
app.get('/api/messages', (req: Request, res: Response) => {
  res.json(messages);
});

// 定义 POST /api/messages 路由，用于创建新消息 (已更新)
app.post('/api/messages', (req: Request, res: Response) => {
  // 从请求体中获取新消息的内容，并进行类型校验
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: '`text` and `sender` are required.' });
  }

  // 创建一个符合 Message 接口的完整消息对象
  const newMessage: Message = {
    id: nanoid(),
    text: String(text),
    sender: String(sender),
    timestamp: new Date().toISOString(),
    type: 'text', // 目前默认为文本消息
  };

  // 将新消息添加到数组中
  messages.push(newMessage);

  // 返回成功状态码 201 (Created) 和新创建的消息
  res.status(201).json(newMessage);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});