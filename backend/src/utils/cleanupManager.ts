import fs from 'fs';
import path from 'path';
import { CLEANUP_CONFIG } from '../config';
import { readMessages, getFilesDirectory } from './jsonlManager';
import { Message } from '../models/message';

/**
 * 清理过期文件
 */
export function cleanupExpiredFiles(): void {
  const filesDir = getFilesDirectory();
  if (!fs.existsSync(filesDir)) {
    console.log('[Cleanup] 文件目录不存在，跳过清理');
    return;
  }

  const now = Date.now();
  const files = fs.readdirSync(filesDir);
  let deletedCount = 0;
  let deletedSize = 0;

  for (const filename of files) {
    const filePath = path.join(filesDir, filename);
    const stats = fs.statSync(filePath);

    // 计算文件保留时长
    const fileSize = stats.size;
    const fileAge = now - stats.mtimeMs; // 文件修改时间到现在的时长

    let retention: number;
    if (fileSize > CLEANUP_CONFIG.FILES.LARGE_FILE_THRESHOLD) {
      // 大文件（>100MB）保留 1 天
      retention = CLEANUP_CONFIG.FILES.LARGE_FILE_RETENTION;
    } else {
      // 小文件（<=100MB）保留 7 天
      retention = CLEANUP_CONFIG.FILES.SMALL_FILE_RETENTION;
    }

    // 如果文件过期，删除
    if (fileAge > retention) {
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
        deletedSize += fileSize;
        console.log(
          `[Cleanup] 删除过期文件: ${filename} (大小: ${formatBytes(fileSize)}, 年龄: ${formatDuration(fileAge)})`
        );
      } catch (error) {
        console.error(`[Cleanup] 删除文件失败: ${filename}`, error);
      }
    }
  }

  if (deletedCount > 0) {
    console.log(
      `[Cleanup] 文件清理完成: 删除 ${deletedCount} 个文件，释放 ${formatBytes(deletedSize)} 空间`
    );
  } else {
    console.log('[Cleanup] 无过期文件需要清理');
  }
}

/**
 * 清理过期的文本消息
 */
export function cleanupExpiredMessages(): void {
  try {
    const messages = readMessages();
    const now = Date.now();
    const retention = CLEANUP_CONFIG.TEXT_MESSAGE_RETENTION;

    // 筛选未过期的消息
    const validMessages = messages.filter((msg) => {
      const messageAge = now - new Date(msg.timestamp).getTime();

      // 文本消息检查过期时间
      if (msg.type === 'text') {
        return messageAge <= retention;
      }

      // 文件消息保留（文件的清理由 cleanupExpiredFiles 处理）
      return true;
    });

    const deletedCount = messages.length - validMessages.length;

    if (deletedCount > 0) {
      // 重写 JSONL 文件
      const messagesFile = path.join(process.cwd(), 'data', 'messages.jsonl');
      const content = validMessages.map((msg) => JSON.stringify(msg)).join('\n') + '\n';
      fs.writeFileSync(messagesFile, content, 'utf-8');

      console.log(`[Cleanup] 消息清理完成: 删除 ${deletedCount} 条过期文本消息`);
    } else {
      console.log('[Cleanup] 无过期消息需要清理');
    }
  } catch (error) {
    console.error('[Cleanup] 消息清理失败:', error);
  }
}

/**
 * 清理孤立的文件消息引用
 * （文件已被删除但消息记录仍存在）
 */
export function cleanupOrphanedFileMessages(): void {
  try {
    const messages = readMessages();
    const filesDir = getFilesDirectory();

    if (!fs.existsSync(filesDir)) {
      return;
    }

    const existingFiles = new Set(fs.readdirSync(filesDir));

    // 筛选有效的消息（文本消息或文件仍存在的文件消息）
    const validMessages = messages.filter((msg) => {
      if (msg.type === 'text') {
        return true;
      }

      if (msg.type === 'file' && msg.fileName) {
        return existingFiles.has(msg.fileName);
      }

      return false;
    });

    const deletedCount = messages.length - validMessages.length;

    if (deletedCount > 0) {
      // 重写 JSONL 文件
      const messagesFile = path.join(process.cwd(), 'data', 'messages.jsonl');
      const content = validMessages.map((msg) => JSON.stringify(msg)).join('\n') + '\n';
      fs.writeFileSync(messagesFile, content, 'utf-8');

      console.log(`[Cleanup] 清理孤立文件消息: 删除 ${deletedCount} 条引用`);
    }
  } catch (error) {
    console.error('[Cleanup] 清理孤立消息失败:', error);
  }
}

/**
 * 执行完整的清理流程
 */
export function runCleanup(): void {
  console.log('[Cleanup] ========== 开始清理任务 ==========');
  console.log(`[Cleanup] 配置: 大文件(>100MB)保留1天, 小文件保留7天, 文本消息保留30天`);

  cleanupExpiredFiles();
  cleanupExpiredMessages();
  cleanupOrphanedFileMessages();

  console.log('[Cleanup] ========== 清理任务完成 ==========\n');
}

/**
 * 启动定时清理任务
 */
export function startCleanupScheduler(): void {
  const interval = CLEANUP_CONFIG.CLEANUP_INTERVAL;

  console.log(
    `[Cleanup] 启动清理调度器，每 ${formatDuration(interval)} 执行一次`
  );

  // 启动时立即执行一次
  runCleanup();

  // 定时执行
  setInterval(() => {
    runCleanup();
  }, interval);
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 格式化时长
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天`;
  if (hours > 0) return `${hours}小时`;
  if (minutes > 0) return `${minutes}分钟`;
  return `${seconds}秒`;
}
