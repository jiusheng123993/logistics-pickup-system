# 物流快递取件系统

一个功能完整的物流快递取件管理系统，支持用户、快递员和管理员三种角色。

## 功能特性

### 用户端
- 我的快递 - 查看个人快递列表和状态
- 快速取件 - 支持输入取件码和扫码取件
- 取件记录 - 查看历史取件记录

### 快递员端
- 我的派件 - 查看派件列表和状态
- 快递入库 - 扫码或手动录入快递信息，自动生成取件码

### 管理后台
- 数据概览 - 查看统计数据和趋势图表
- 快递管理 - 管理所有快递信息
- 用户管理 - 管理系统用户

## 技术栈

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **样式方案**: Tailwind CSS
- **数据库**: PostgreSQL + Prisma ORM
- **认证方案**: NextAuth.js (待集成)

## 项目结构

```
logistics-pickup-system/
├── prisma/
│   └── schema.prisma      # 数据库模型定义
├── src/
│   └── app/
│       ├── (auth)/        # 认证相关页面
│       ├── user/          # 用户端页面
│       ├── courier/       # 快递员端页面
│       ├── admin/         # 管理后台页面
│       ├── layout.tsx     # 根布局
│       ├── page.tsx       # 首页
│       └── globals.css    # 全局样式
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 前置要求

- Node.js 18+ 
- PostgreSQL 14+ (或使用Docker)

### 安装依赖

```bash
npm install
```

### 数据库设置

1. 创建 `.env` 文件并配置数据库连接：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/logistics?schema=public"
```

2. 运行数据库迁移：

```bash
npx prisma migrate dev
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 数据库模型

### User (用户)
- 支持三种角色：USER, COURIER, ADMIN
- 关联快递和取件记录

### Package (快递)
- 运单号、收件人、取件码、状态等
- 状态流转：PENDING → IN_STORAGE → PICKED_UP

### Pickup (取件记录)
- 记录每次取件操作

### Notification (通知)
- 系统通知和取件提醒

## 开发说明

### 分支策略

- `main` - 生产环境分支
- `develop` - 开发集成分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支

### 提交规范

使用约定式提交格式：

```
type(scope): description
```

类型示例：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式调整
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 许可证

MIT
