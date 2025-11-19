import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { getOriginalFilesDirectory, getPreviewFilesDirectory } from '../utils/jsonlManager';

export async function generatePreview(fileName: string, mimeType: string): Promise<string | null> {
  const originalPath = path.join(getOriginalFilesDirectory(), fileName);
  const previewDir = getPreviewFilesDirectory();
  
  if (!fs.existsSync(originalPath)) {
    console.error(`Original file not found: ${originalPath}`);
    return null;
  }

  // 确保预览目录存在
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  try {
    // 获取不带扩展名的文件名
    const baseName = path.parse(fileName).name;

    if (mimeType.startsWith('image/')) {
      return await processImage(originalPath, previewDir, baseName, mimeType);
    } else if (mimeType.startsWith('video/')) {
      return await processVideo(originalPath, previewDir, baseName);
    }
  } catch (error) {
    console.error('Media processing error:', error);
    return null;
  }

  return null;
}

async function processImage(originalPath: string, previewDir: string, baseName: string, mimeType: string): Promise<string | null> {
  // SVG 不需要转换，直接返回 null (前端使用原图) 或者也可以转
  if (mimeType === 'image/svg+xml') return null;

  const previewFileName = baseName + '.webp';
  const previewPath = path.join(previewDir, previewFileName);
  
  await sharp(originalPath)
    .webp({ quality: 80 }) // 稍微压缩一下
    .toFile(previewPath);
    
  return previewFileName;
}

function processVideo(originalPath: string, previewDir: string, baseName: string): Promise<string | null> {
  // 视频转 webm
  const previewFileName = baseName + '.webm';
  const previewPath = path.join(previewDir, previewFileName);

  return new Promise((resolve, reject) => {
    ffmpeg(originalPath)
      .output(previewPath)
      .videoCodec('libvpx') // 使用 VP8，通常比 VP9 快
      .audioCodec('libvorbis')
      .format('webm')
      .size('?x720') // 限制高度为 720p，保持比例
      .on('end', () => {
        resolve(previewFileName);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        // 转换失败返回 null，前端将显示原视频或无法预览
        resolve(null);
      })
      .run();
  });
}
