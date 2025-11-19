export interface Message {
  id: string;
  text: string;
  timestamp: string;
  type: 'text' | 'file';
  sender: string; // 消息发送者
  fileName?: string; // 文件名（仅文件类型消息）
  previewFileName?: string; // 预览文件名（仅图片/视频类型消息）
}