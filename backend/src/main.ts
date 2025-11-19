import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';
import { Message } from './models/message';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import {
  ensureDataDirectory,
  readMessages,
  saveMessage,
  updateMessage,
  getFilesDirectory,
  getOriginalFilesDirectory,
  deleteMessage,
} from './utils/jsonlManager';
import { startCleanupScheduler } from './utils/cleanupManager';
import { generatePreview } from './scripts/mediaProcessor';
import { SERVER_CONFIG, UPLOAD_CONFIG } from './config';
import fs from 'fs';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = SERVER_CONFIG.PORT;

// 广播消息给所有连接的客户端
function broadcastMessage(type: 'new_message' | 'delete_message' | 'update_message', payload: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
}

// 初始化数据目录
ensureDataDirectory();

// 使用 cors 中间件，允许所有跨域请求
app.use(cors());
// 使用 express.json() 中间件来解析所有传入的 JSON 请求体
app.use(express.json());

// 静态文件服务：提供上传的文件
// 优先尝试从 original 目录服务（用于新上传的文件，且没有预览图或直接访问的情况）
app.use('/api/files', express.static(getOriginalFilesDirectory()));
// 然后尝试从 files 根目录服务（用于旧文件，以及访问 preview 目录）
app.use('/api/files', express.static(getFilesDirectory()));

// 配置 multer 文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, getOriginalFilesDirectory());
  },
  filename: (req, file, cb) => {
    // 修复中文文件名乱码：将 latin1 编码的字符串转换回 buffer，再用 utf8 解码
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // 生成唯一文件名，保留原始扩展名
    const uniqueName = `${nanoid()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE, // 500MB 限制
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
  broadcastMessage('new_message', newMessage);
  res.status(201).json(newMessage);
});

// 定义 POST /api/upload 路由，用于上传文件
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
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
    previewStatus: 'pending', // 初始状态为 pending
  };

  // TEST：延长上传时间用于测试
  console.log('Simulating upload delay...');
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log('Simulated upload delay complete.');
  // 先保存并广播消息（第一阶段完成）
  saveMessage(fileMessage);
  broadcastMessage('new_message', fileMessage);
  res.status(201).json(fileMessage);

  // 异步生成预览文件（第二阶段）
  try {
    const generatedPreview = await generatePreview(req.file.filename, req.file.mimetype);

    // TEST：延长生成时间用于测试
    console.log('Simulating preview generation delay...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log('Simulated preview generation delay complete.');
    
    // 更新消息状态
    fileMessage.previewStatus = generatedPreview ? 'completed' : 'failed';
    if (generatedPreview) {
      fileMessage.previewFileName = generatedPreview;
    }

    // 保存更新后的消息并广播
    updateMessage(fileMessage);
    broadcastMessage('update_message', fileMessage);
    
  } catch (error) {
    console.error('Preview generation failed:', error);
    fileMessage.previewStatus = 'failed';
    updateMessage(fileMessage);
    broadcastMessage('update_message', fileMessage);
  }
});

// 定义 GET /api/download/:id 路由，用于下载文件（带正确文件名）
app.get('/api/download/:id', (req: Request, res: Response) => {
  const messageId = req.params.id;
  const messages = readMessages();
  const message = messages.find((m) => m.id === messageId);

  if (!message || message.type !== 'file' || !message.fileName) {
    return res.status(404).json({ error: 'File not found.' });
  }

  // 尝试从 original 目录获取
  let filePath = path.join(getOriginalFilesDirectory(), message.fileName);
  
  // 兼容旧文件：如果 original 里没有，去根目录找
  if (!fs.existsSync(filePath)) {
    filePath = path.join(getFilesDirectory(), message.fileName);
  }

  // 设置正确的文件名（不带前缀）
  res.download(filePath, message.text, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).json({ error: 'Failed to download file.' });
    }
  });
});

// 定义 DELETE /api/messages/:id 路由，用于删除消息
app.delete('/api/messages/:id', (req: Request, res: Response) => {
  const messageId = req.params.id;

  const success = deleteMessage(messageId);

  if (success) {
    broadcastMessage('delete_message', messageId);
    res.status(200).json({ message: 'Message deleted successfully' });
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
});

// 启动服务器
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

  // 启动数据清理调度器
  startCleanupScheduler();
});