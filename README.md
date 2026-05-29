# 物流快递取件系统

一个功能完整的物流快递取件管理系统，支持用户自助取件、快递员入库管理、管理员后台等功能。

## 技术栈

- **框架**: Next.js 15
- **语言**: TypeScript
- **数据库**: SQLite (Prisma ORM)
- **样式**: Tailwind CSS
- **认证**: JWT

## 功能特性

### 用户功能
- 用户注册/登录
- 查看我的快递
- 自助取件（输入取件码）
- 查看取件历史

### 快递员功能
- 快递员注册/登录
- 查看我的派件
- 快递入库（生成取件码）

### 管理员功能
- 数据概览（统计信息）
- 快递管理（查看/编辑/删除）
- 用户管理（查看/编辑/删除）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 初始化数据库并插入测试数据
npm run db:setup
```

或者分步执行：

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库 schema
npm run db:push

# 运行 seed 脚本（创建测试数据）
npm run db:seed
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 测试账号

系统初始化后会创建以下测试账号：

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800000000 | admin123 |
| 快递员 | 13800000001 | courier123 |
| 用户 | 13800000002 | user123 |

## 项目结构

```
logistics-pickup-system/
├── prisma/                 # Prisma 相关
│   ├── schema.prisma      # 数据库 schema
│   └── seed.ts            # 数据库种子脚本
├── src/
│   ├── app/
│   │   ├── admin/         # 管理员页面
│   │   ├── api/           # API 路由
│   │   │   ├── auth/      # 认证 API
│   │   │   ├── packages/  # 快递 API
│   │   │   ├── pickups/   # 取件 API
│   │   │   ├── users/     # 用户 API
│   │   │   └── stats/     # 统计 API
│   │   ├── courier/       # 快递员页面
│   │   ├── login/         # 登录页面
│   │   ├── register/      # 注册页面
│   │   ├── user/          # 用户页面
│   │   ├── globals.css    # 全局样式
│   │   ├── layout.tsx     # 根布局
│   │   └── page.tsx       # 首页
│   ├── components/        # 组件
│   ├── lib/               # 工具库
│   │   ├── api.ts         # API 响应工具
│   │   ├── api-client.ts  # 前端 API 客户端
│   │   ├── auth.ts        # 认证工具
│   │   ├── prisma.ts      # Prisma 客户端
│   │   ├── server-utils.ts # 服务端工具
│   │   └── session.ts     # 会话管理（JWT）
│   └── types/             # TypeScript 类型
├── .env.example           # 环境变量示例
└── package.json
```

## API 文档

### 认证 API

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/logout` - 用户登出

### 快递 API

- `GET /api/packages` - 获取快递列表
- `POST /api/packages` - 创建快递（入库）
- `POST /api/packages/pickup` - 取件

### 取件记录 API

- `GET /api/pickups` - 获取取件历史

### 用户 API

- `GET /api/users` - 获取用户列表（仅管理员）
- `POST /api/users` - 创建用户（仅管理员）

### 统计 API

- `GET /api/stats` - 获取统计数据（仅管理员）

## 安全特性

- JWT 认证，防止会话劫持
- 密码使用 bcrypt 加密存储
- 基于角色的权限控制
- API 输入验证

## 开发说明

### 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改：

```env
# 数据库连接
DATABASE_URL="file:./dev.db"

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET="your-secret-key-change-in-production"
```

### 数据库操作

```bash
# 修改 schema 后更新数据库
npm run db:push

# 重新生成 Prisma Client
npm run db:generate
```

## 构建和部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 许可证

MIT
