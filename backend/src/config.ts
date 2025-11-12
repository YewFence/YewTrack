/**
 * 应用配置文件
 * 集中管理所有可配置项
 */

/**
 * 文件上传配置
 */
export const UPLOAD_CONFIG = {
  // 文件上传大小限制（字节）
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
} as const;

/**
 * 数据清理配置
 */
export const CLEANUP_CONFIG = {
  // 文件保留策略
  FILES: {
    // 大文件（>100MB）保留时长（毫秒）
    LARGE_FILE_RETENTION: 1 * 24 * 60 * 60 * 1000, // 1 天
    // 大文件大小阈值（字节）
    LARGE_FILE_THRESHOLD: 100 * 1024 * 1024, // 100MB
    // 小文件（<=100MB）保留时长（毫秒）
    SMALL_FILE_RETENTION: 7 * 24 * 60 * 60 * 1000, // 7 天
  },

  // 文本消息保留时长（毫秒）
  TEXT_MESSAGE_RETENTION: 30 * 24 * 60 * 60 * 1000, // 30 天

  // 清理任务执行间隔（毫秒）
  CLEANUP_INTERVAL: 1 * 60 * 60 * 1000, // 每 1 小时执行一次
} as const;

/**
 * 服务器配置
 */
export const SERVER_CONFIG = {
  PORT: 3000,
} as const;

/**
 * 数据存储路径
 */
export const DATA_PATHS = {
  DATA_DIR: 'data',
  MESSAGES_FILE: 'data/messages.jsonl',
  FILES_DIR: 'data/files',
} as const;
