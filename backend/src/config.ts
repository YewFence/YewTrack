/**
 * 应用配置文件
 * 从环境变量中读取配置，支持默认值
 * 将用户友好的单位（天、MB）转换为程序使用的单位（毫秒、字节）
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// 加载根目录的 .env 文件（开发和生产环境都适用）
config({ path: resolve(__dirname, '../../..', '.env') });

/**
 * 解析环境变量为数字，提供默认值
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  return value ? parseFloat(value) : defaultValue;
}

/**
 * 解析环境变量为字符串，提供默认值
 */
function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * 将天转换为毫秒
 */
function daysToMilliseconds(days: number): number {
  return Math.floor(days * 24 * 60 * 60 * 1000);
}

/**
 * 将 MB 转换为字节
 */
function mbToBytes(mb: number): number {
  return Math.floor(mb * 1024 * 1024);
}

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  // 文件上传大小限制（字节）
  MAX_FILE_SIZE: mbToBytes(getEnvNumber('MAX_FILE_SIZE_MB', 500)), // 默认 500MB
} as const;

/**
 * 数据清理配置
 */
export const CLEANUP_CONFIG = {
  // 文件保留策略
  FILES: {
    // 大文件保留时长（毫秒）
    LARGE_FILE_RETENTION: daysToMilliseconds(getEnvNumber('LARGE_FILE_RETENTION_DAYS', 1)), // 默认 1 天
    // 大文件大小阈值（字节）
    LARGE_FILE_THRESHOLD: mbToBytes(getEnvNumber('LARGE_FILE_THRESHOLD_MB', 100)), // 默认 100MB
    // 小文件保留时长（毫秒）
    SMALL_FILE_RETENTION: daysToMilliseconds(getEnvNumber('SMALL_FILE_RETENTION_DAYS', 7)), // 默认 7 天
  },

  // 文本消息保留时长（毫秒）
  TEXT_MESSAGE_RETENTION: daysToMilliseconds(getEnvNumber('TEXT_MESSAGE_RETENTION_DAYS', 30)), // 默认 30 天

  // 清理任务执行间隔（毫秒）
  CLEANUP_INTERVAL: daysToMilliseconds(getEnvNumber('CLEANUP_INTERVAL_DAYS', 1 / 24)), // 默认 1 小时
} as const;

/**
 * 服务器配置
 */
export const SERVER_CONFIG = {
  PORT: getEnvNumber('BACKEND_PORT', 3000), // 默认 3000
} as const;

/**
 * 数据存储路径
 */
export const DATA_PATHS = {
  DATA_DIR: getEnvString('DATA_DIR', 'data'),
  MESSAGES_FILE: getEnvString('MESSAGES_FILE', 'data/messages.jsonl'),
  FILES_DIR: getEnvString('FILES_DIR', 'data/files'),
} as const;
