export interface Message {
  id: string;
  text: string;
  timestamp: string;
  type: 'text' | 'file';
  sender: string;
  fileName?: string;
  previewFileName?: string;
  previewStatus?: 'uploading' | 'pending' | 'completed' | 'failed';
}
