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
