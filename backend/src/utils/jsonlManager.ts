import fs from 'fs';
import path from 'path';
import { Message } from '../models/message';

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.jsonl');

/**
 * 确保数据目录存在
 */
export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filesDir = path.join(DATA_DIR, 'files');
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }
}

/**
 * 读取所有消息
 */
export function readMessages(): Message[] {
  ensureDataDirectory();

  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }

  const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
  const lines = content.trim().split('\n');

  const messages: Message[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      const message = JSON.parse(trimmed);
      messages.push(message);
    } catch (error) {
      console.error('Failed to parse message line:', trimmed, error);
      // 跳过损坏的行，继续读取其他消息
    }
  }

  return messages;
}

/**
 * 保存单条消息（追加模式）
 */
export function saveMessage(message: Message): void {
  ensureDataDirectory();
  fs.appendFileSync(MESSAGES_FILE, JSON.stringify(message) + '\n', 'utf-8');
}

/**
 * 获取文件存储目录
 */
export function getFilesDirectory(): string {
  return path.join(DATA_DIR, 'files');
}

/**
 * 删除指定 ID 的消息
 * @returns 是否成功删除（找到并删除返回 true，未找到返回 false）
 */
export function deleteMessage(messageId: string): boolean {
  ensureDataDirectory();

  const messages = readMessages();
  const messageToDelete = messages.find((m) => m.id === messageId);

  if (!messageToDelete) {
    return false; // 消息不存在
  }

  // 如果是文件消息，同时删除对应的文件
  if (messageToDelete.type === 'file' && messageToDelete.fileName) {
    const filePath = path.join(getFilesDirectory(), messageToDelete.fileName);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Delete] 已删除文件: ${messageToDelete.fileName}`);
      } catch (error) {
        console.error(`[Delete] 删除文件失败: ${messageToDelete.fileName}`, error);
      }
    }
  }

  // 过滤掉要删除的消息
  const remainingMessages = messages.filter((m) => m.id !== messageId);

  // 重写 JSONL 文件
  const content = remainingMessages.map((msg) => JSON.stringify(msg)).join('\n') + '\n';
  fs.writeFileSync(MESSAGES_FILE, content, 'utf-8');

  console.log(`[Delete] 已删除消息: ${messageId} (类型: ${messageToDelete.type})`);
  return true;
}
