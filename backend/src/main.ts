import express, { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { Message } from './models/message';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import {
  ensureDataDirectory,
  readMessages,
  saveMessage,
  getFilesDirectory,
} from './utils/csvManager';

const app = express();
const port = 3000;

// 初始化数据目录
ensureDataDirectory();

// 使用 cors 中间件，允许所有跨域请求
app.use(cors());
// 使用 express.json() 中间件来解析所有传入的 JSON 请求体
app.use(express.json());

// 静态文件服务：提供上传的文件
app.use('/api/files', express.static(getFilesDirectory()));

// 配置 multer 文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getFilesDirectory());
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，保留原始扩展名
    const uniqueName = `${nanoid()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 限制
  },
});

// 定义 GET /api/messages 路由，返回消息列表
app.get('/api/messages', (req: Request, res: Response) => {
  const messages = readMessages();
  res.json(messages);
});

// 定义 POST /api/messages 路由，用于创建新消息
app.post('/api/messages', (req: Request, res: Response) => {
  const { text, sender } = req.body;

  if (!text || !sender) {
    return res.status(400).json({ error: '`text` and `sender` are required.' });
  }

  const newMessage: Message = {
    id: nanoid(),
    text: String(text),
    sender: String(sender),
    timestamp: new Date().toISOString(),
    type: 'text',
  };

  saveMessage(newMessage);
  res.status(201).json(newMessage);
});

// 定义 POST /api/upload 路由，用于上传文件
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { sender } = req.body;

  if (!sender) {
    return res.status(400).json({ error: '`sender` is required.' });
  }

  const fileMessage: Message = {
    id: nanoid(),
    text: req.file.originalname,
    sender: String(sender),
    timestamp: new Date().toISOString(),
    type: 'file',
    fileName: req.file.filename,
  };

  saveMessage(fileMessage);
  res.status(201).json(fileMessage);
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});