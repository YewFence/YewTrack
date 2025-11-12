/**
 * 获取或生成设备唯一标识符
 * 存储在 localStorage 中，用于区分不同设备
 */
export function getDeviceId(): string {
  const STORAGE_KEY = 'yewtrack_device_id';

  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    // 生成简单的随机 ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}
