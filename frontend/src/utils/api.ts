/**
 * 获取 API 基础 URL
 * 从环境变量中读取，如果未设置则返回空字符串
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL || '';
}

/**
 * 构建完整的 API URL
 */
export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  return `${base}${path}`;
}
