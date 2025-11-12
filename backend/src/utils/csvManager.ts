import fs from 'fs';
import path from 'path';
import { Message } from '../models/message.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.csv');

/**
 * 确保数据目录和文件存在
 */
export function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const filesDir = path.join(DATA_DIR, 'files');
  if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir, { recursive: true });
  }

  if (!fs.existsSync(MESSAGES_FILE)) {
    // 创建带表头的 CSV 文件
    const header = 'id,text,timestamp,type,sender,fileName\n';
    fs.writeFileSync(MESSAGES_FILE, header, 'utf-8');
  }
}

/**
 * CSV 转义处理
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * CSV 反转义处理
 */
function unescapeCSV(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

/**
 * 解析 CSV 行
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++; // 跳过下一个引号
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result.map(unescapeCSV);
}

/**
 * 读取所有消息
 */
export function readMessages(): Message[] {
  ensureDataDirectory();

  const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
  const lines = content.trim().split('\n');

  if (lines.length <= 1) {
    return []; // 只有表头或空文件
  }

  const messages: Message[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [id, text, timestamp, type, sender, fileName] = parseCSVLine(line);

    messages.push({
      id,
      text: text || '',
      timestamp,
      type: (type as 'text' | 'file') || 'text',
      sender,
      fileName: fileName || undefined,
    });
  }

  return messages;
}

/**
 * 保存单条消息（追加模式）
 */
export function saveMessage(message: Message): void {
  ensureDataDirectory();

  const line = [
    escapeCSV(message.id),
    escapeCSV(message.text),
    escapeCSV(message.timestamp),
    escapeCSV(message.type),
    escapeCSV(message.sender),
    escapeCSV(message.fileName || ''),
  ].join(',');

  fs.appendFileSync(MESSAGES_FILE, line + '\n', 'utf-8');
}

/**
 * 获取文件存储目录
 */
export function getFilesDirectory(): string {
  return path.join(DATA_DIR, 'files');
}
