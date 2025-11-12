# YewTrack 消息传输网页应用

一个基于 Vue 3 + Express 的跨设备消息和文件传输网页应用。

## 🎯 项目背景
因为我想要一个简单轻量的工具，在tailscale网内的不同设备间传输**文本消息**和**文件**，正好我有一个服务器，就当是学习Typescripts了

## ✨ 功能特性

### 核心功能
- 📝 **文本消息发送** - 实时发送和接收文本消息
- 📎 **文件传输** - 支持上传和接收文件
- 🖼️ **多媒体预览** - 图片、视频在线预览
- 🔴 **手动刷新** - 右上角刷新按钮立即同步消息
- 🗑️ **消息删除** - 点击删除按钮手动删除指定消息
- 📅 **时间戳显示** - 显示消息发送时间/日期
- 📃 **轮转删除** - 超过保留期限的消息自动删除

### 数据管理
- 💾 **JSONL 存储** - 轻量级消息持久化
- 🗂️ **文件分离存储** - 文件独立保存在 `data/files/`
- 🔄 **自动轮转清理**：
  - 大文件（>100MB）保留 1 天
  - 小文件（≤100MB）保留 7 天
  - 文本消息保留 30 天
- 🕐 **定时任务** - 每小时自动清理过期数据

### 设备识别
- 🆔 **唯一设备 ID** - 基于 localStorage 自动生成
- ↔️ **左右布局** - 本设备消息显示在右侧（蓝色），其他设备在左侧（灰色）

## 🚀 快速开始

## 本地开发

### 前置要求
- Node.js 20+
- pnpm 10+

### 安装依赖

```bash
# 安装 pnpm（如果未安装）
npm install -g pnpm

# 安装所有依赖
pnpm install
```

### 开发模式

```bash
# 启动后端（端口 3000）
cd backend
pnpm run dev

# 启动前端（端口 5173）
cd frontend
pnpm run dev
```

访问 `http://localhost:5173` 即可使用。

### 生产部署（Docker）

#### 🔒 安全注意事项

- 本应用未实现用户认证，**仅适用于局域网或受信任的环境**
- 文件上传限制为可在 `config.ts` 中调整
- 生产环境建议添加（或者说TODO）：
  - HTTPS 支持
  - 用户认证
  - 文件类型白名单
  - 请求频率限制


```bash
# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

> 默认仅绑定本地回环地址

访问 `http://localhost:8041` 即可使用。

## 📁 项目结构

```
yewtrack/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config.ts        # 配置文件（上传限制、清理策略等）
│   │   ├── main.ts          # Express 应用入口
│   │   ├── models/          # 数据模型
│   │   │   └── message.ts   # Message 接口定义
│   │   └── utils/           # 工具函数
│   │       ├── jsonlManager.ts      # JSONL 文件操作
│   │       ├── cleanupManager.ts    # 数据清理管理
│   │       └── migrateToJsonl.ts    # CSV 迁移脚本
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── App.vue          # 主应用组件
│   │   ├── components/      # Vue 组件
│   │   │   ├── MessageList.vue   # 消息列表
│   │   │   └── InputBar.vue      # 输入栏
│   │   ├── types/           # TypeScript 类型
│   │   │   └── message.ts   # Message 类型定义
│   │   └── utils/           # 工具函数
│   │       ├── deviceId.ts  # 设备 ID 管理
│   │       └── api.ts       # API URL 构建
│   ├── .env.development     # 开发环境配置
│   ├── .env.production      # 生产环境配置
│   ├── Dockerfile
│   ├── nginx.conf           # Nginx 配置
│   └── package.json
│
├── data/                    # 数据目录（自动生成，git已忽略）
│   ├── messages.jsonl       # 消息存储文件
│   └── files/               # 上传的文件
│
├── docker-compose.yml       # Docker Compose 配置
└── README.md
```

## ⚙️ 配置说明

所有配置项集中在 `backend/src/config.ts`：

```typescript
// 文件上传限制
MAX_FILE_SIZE: 500MB

// 数据清理策略
LARGE_FILE_RETENTION: 1 天    // >100MB
SMALL_FILE_RETENTION: 7 天    // ≤100MB
TEXT_MESSAGE_RETENTION: 30 天

// 清理任务频率
CLEANUP_INTERVAL: 每 1 小时
```

### 环境变量配置

**开发环境** (`.env.development`)
```env
VITE_API_BASE_URL=http://localhost:3000
```

**生产环境** (`.env.production`)
```env
VITE_API_BASE_URL=
```

**自定义配置** (`.env.local` - 不会提交到 Git)
```bash
cp frontend/.env.example frontend/.env.local
# 编辑 .env.local 自定义配置
```

## 🔌 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/messages` | 获取所有消息 |
| POST | `/api/messages` | 发送文本消息 |
| POST | `/api/upload` | 上传文件 |
| GET | `/api/files/:filename` | 访问上传的文件 |
| GET | `/api/download/:id` | 下载文件（带原始文件名） |
| DELETE | `/api/messages/:id` | 删除消息 |

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7
- **样式**: Tailwind CSS 3
- **类型**: TypeScript 5
- **HTTP 服务**: Nginx (生产环境)

### 后端
- **框架**: Express 5
- **运行时**: Node.js 20
- **类型**: TypeScript 5
- **文件上传**: Multer 2
- **存储格式**: JSONL (JSON Lines)

### DevOps
- **容器化**: Docker + Docker Compose
- **包管理**: pnpm (workspace)
- **开发工具**: ts-node-dev (热重载)

## 📝 开发指南

### Git 提交规范

本项目使用约定式提交（Conventional Commits）：

```
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链更新
```

## 🎨 UI 特性

- ✅ 响应式设计，适配移动端和桌面端
- ✅ 聊天气泡样式（本设备蓝色，其他设备灰色）
- ✅ 图片/视频自动预览
- ✅ 文件下载带原始文件名
- ✅ 消息时间戳（今天显示时间，其他显示日期）
- ✅ 删除按钮悬停显示
- ✅ 刷新按钮旋转动画

## 📄 许可证

MIT License © 2025 YewFence