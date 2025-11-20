import fs from 'fs';
import path from 'path';

/**
 * 数据迁移脚本：CSV -> JSONL
 *
 * 使用方法：
 * cd backend
 * ts-node src/utils/migrateToJsonl.ts
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const CSV_FILE = path.join(DATA_DIR, 'messages.csv');
const JSONL_FILE = path.join(DATA_DIR, 'messages.jsonl');
const BACKUP_FILE = path.join(DATA_DIR, 'messages.csv.backup');

interface Message {
  id: string;
  text: string;
  timestamp: string;
  type: 'text' | 'file';
  sender: string;
  fileName?: string;
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
      i++;
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
 * 从 CSV 读取消息
 */
function readCSVMessages(): Message[] {
  if (!fs.existsSync(CSV_FILE)) {
    console.log('❌ CSV 文件不存在，无需迁移');
    return [];
  }

  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = content.trim().split('\n');

  if (lines.length <= 1) {
    console.log('✅ CSV 文件为空，无需迁移');
    return [];
  }

  const messages: Message[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const [id, text, timestamp, type, sender, fileName] = parseCSVLine(line);
      messages.push({
        id,
        text: text || '',
        timestamp,
        type: (type as 'text' | 'file') || 'text',
        sender,
        fileName: fileName || undefined,
      });
    } catch (error) {
      console.error(`⚠️  解析 CSV 行失败 (第 ${i + 1} 行):`, line);
    }
  }

  return messages;
}

/**
 * 写入 JSONL 文件
 */
function writeJSONLMessages(messages: Message[]): void {
  const lines = messages.map(msg => JSON.stringify(msg)).join('\n');
  fs.writeFileSync(JSONL_FILE, lines + '\n', 'utf-8');
}

/**
 * 主函数
 */
function migrate(): void {
  console.log('🚀 开始数据迁移：CSV -> JSONL\n');

  // 检查 JSONL 文件是否已存在
  if (fs.existsSync(JSONL_FILE)) {
    console.log('⚠️  messages.jsonl 已存在！');
    console.log('如需重新迁移，请先删除或备份该文件。');
    return;
  }

  // 读取 CSV 消息
  console.log('📖 读取 CSV 文件...');
  const messages = readCSVMessages();

  if (messages.length === 0) {
    console.log('✅ 无需迁移');
    return;
  }

  console.log(`✅ 成功读取 ${messages.length} 条消息\n`);

  // 写入 JSONL 文件
  console.log('📝 写入 JSONL 文件...');
  writeJSONLMessages(messages);
  console.log(`✅ 成功写入到 ${JSONL_FILE}\n`);

  // 备份原 CSV 文件
  console.log('💾 备份原 CSV 文件...');
  fs.copyFileSync(CSV_FILE, BACKUP_FILE);
  console.log(`✅ 已备份到 ${BACKUP_FILE}\n`);

  console.log('🎉 迁移完成！');
  console.log('\n提示：');
  console.log('- 原 CSV 文件已备份为 messages.csv.backup');
  console.log('- 可以删除 messages.csv 文件（或保留备份）');
}

// 运行迁移
migrate();
