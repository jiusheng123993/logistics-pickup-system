# 物流快递取件系统 - 项目文档

## 项目概述

一个功能完整的物流快递取件管理系统，基于 Next.js 15 + TypeScript + Prisma + SQLite 构建，支持用户自助取件、快递员入库管理、管理员后台等功能。

## 目录

1. [技术架构](#技术架构)
2. [数据库设计](#数据库设计)
3. [核心模块说明](#核心模块说明)
4. [API 接口文档](#api-接口文档)
5. [认证与权限](#认证与权限)
6. [部署指南](#部署指南)
7. [常见问题](#常见问题)

## 技术架构

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15 | React 框架 |
| React | 19 | UI 库 |
| TypeScript | 5 | 类型安全 |
| Prisma | 5 | ORM 数据库操作 |
| SQLite | - | 数据库（开发环境） |
| Tailwind CSS | 3.4 | 样式框架 |
| bcryptjs | 2.4 | 密码加密 |
| jsonwebtoken | 9.0 | JWT 认证（当前使用简单 token） |

### 项目结构

```
logistics-pickup-system/
├── prisma/                      # Prisma 数据库配置
│   ├── schema.prisma            # 数据模型定义
│   └── seed.ts                  # 测试数据种子脚本
├── src/
│   ├── app/
│   │   ├── admin/               # 管理员模块
│   │   │   ├── page.tsx         # 数据概览
│   │   │   ├── packages/        # 快递管理
│   │   │   └── users/           # 用户管理
│   │   ├── api/                 # API 路由
│   │   │   ├── auth/            # 认证接口
│   │   │   ├── packages/        # 快递接口
│   │   │   ├── pickups/         # 取件记录接口
│   │   │   ├── users/           # 用户接口
│   │   │   └── stats/           # 统计接口
│   │   ├── courier/             # 快递员模块
│   │   │   ├── page.tsx         # 我的派件
│   │   │   └── inbound/         # 快递入库
│   │   ├── user/                # 用户模块
│   │   │   ├── page.tsx         # 我的快递
│   │   │   ├── pickup/          # 取件
│   │   │   └── history/         # 取件历史
│   │   ├── login/               # 登录页面
│   │   ├── register/            # 注册页面
│   │   ├── layout.tsx           # 根布局
│   │   └── page.tsx             # 首页
│   ├── components/              # 公共组件
│   │   └── LogoutButton.tsx    # 登出按钮
│   ├── lib/                     # 工具库
│   │   ├── api.ts              # API 响应工具
│   │   ├── api-client.ts       # 前端 API 客户端
│   │   ├── auth.ts             # 认证工具
│   │   ├── prisma.ts           # Prisma 客户端
│   │   ├── server-utils.ts     # 服务端工具
│   │   └── session.ts          # 会话管理
│   ├── types/                  # TypeScript 类型定义
│   └── middleware.ts           # Next.js 中间件（认证）
├── docs/                       # 文档目录
├── .env                        # 环境变量
└── package.json
```

## 数据库设计

### 数据模型

#### User（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键，CUID |
| name | String | 用户姓名 |
| phone | String | 手机号（唯一） |
| email | String? | 邮箱（唯一，可选） |
| password | String | 密码（bcrypt 加密） |
| role | String | 角色（USER/COURIER/ADMIN） |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### Package（快递表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键，CUID |
| trackingNumber | String | 运单号（唯一） |
| recipientName | String | 收件人姓名 |
| recipientPhone | String | 收件人手机号 |
| courierId | String? | 快递员 ID |
| pickupCode | String | 取件码 |
| status | String | 状态（PENDING/IN_STORAGE/PICKED_UP/EXPIRED） |
| storageLocation | String? | 存放位置 |
| notes | String? | 备注 |
| arrivedAt | DateTime? | 到达时间 |
| pickedUpAt | DateTime? | 取件时间 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

#### Pickup（取件记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键，CUID |
| packageId | String | 快递 ID |
| userId | String | 用户 ID |
| pickupCode | String | 取件码 |
| verified | Boolean | 是否已验证 |
| createdAt | DateTime | 创建时间 |

#### Notification（通知表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 主键，CUID |
| userId | String | 用户 ID |
| packageId | String? | 快递 ID |
| title | String | 通知标题 |
| content | String | 通知内容 |
| read | Boolean | 是否已读 |
| createdAt | DateTime | 创建时间 |

## 核心模块说明

### 1. 认证模块

**职责**：处理用户登录、注册、登出，会话管理

**核心文件**：
- `src/app/api/auth/login/route.ts` - 登录 API
- `src/app/api/auth/register/route.ts` - 注册 API
- `src/app/api/auth/logout/route.ts` - 登出 API
- `src/lib/session.ts` - 会话管理
- `src/middleware.ts` - 认证中间件

**关键逻辑**：

#### 登录流程
1. 验证手机号和密码
2. 查询用户数据库
3. bcrypt 密码验证
4. 创建会话 token（base64 编码的 JSON）
5. 设置 HTTP Only Cookie
6. 返回用户角色
7. 前端根据角色跳转到对应页面

#### 会话管理
- 当前使用简单的 base64 编码的 JSON token（便于调试）
- Token 包含：userId, phone, name, role
- 存储在 HTTP Only Cookie 中
- Cookie 有效期：7 天
- 中间件在每次请求时验证 token

### 2. 用户模块

**职责**：普通用户功能 - 查看快递、自助取件、查看历史

**页面**：
- `/user` - 我的快递
- `/user/pickup` - 取件
- `/user/history` - 取件历史

**权限**：USER、COURIER、ADMIN 角色可访问

### 3. 快递员模块

**职责**：快递员功能 - 查看派件、快递入库

**页面**：
- `/courier` - 我的派件
- `/courier/inbound` - 快递入库

**权限**：COURIER、ADMIN 角色可访问

### 4. 管理员模块

**职责**：管理员功能 - 数据概览、快递管理、用户管理

**页面**：
- `/admin` - 数据概览
- `/admin/packages` - 快递管理
- `/admin/users` - 用户管理

**权限**：仅 ADMIN 角色可访问

### 5. 中间件模块

**职责**：路由级别的认证和权限控制

**配置**：
- 匹配路由：`/user/:path*`, `/courier/:path*`, `/admin/:path*`
- 公共路径：`/`, `/login`, `/register`, `/test-login`, `/simple-test`
- 权限验证：基于用户角色的访问控制

**工作流程**：
1. 检查是否为公共路径，是则放行
2. 检查 Cookie 中是否有 token，没有则跳转到登录页
3. 解析 token，无效则跳转到登录页
4. 根据用户角色验证访问权限
5. 权限验证通过则放行

## API 接口文档

### 认证 API

#### POST /api/auth/login

**描述**：用户登录

**请求体**：
```json
{
  "phone": "13800000002",
  "password": "user123"
}
```

**成功响应**（200）：
```json
{
  "success": true,
  "role": "USER"
}
```

**失败响应**（400/401）：
```json
{
  "error": "密码错误"
}
```

#### POST /api/auth/register

**描述**：用户注册

**请求体**：
```json
{
  "name": "张三",
  "phone": "13800000003",
  "email": "zhangsan@example.com",
  "password": "password123",
  "role": "USER"
}
```

#### POST /api/auth/logout

**描述**：用户登出

**响应**：清除 auth_token Cookie

### 快递 API

#### GET /api/packages

**描述**：获取快递列表

**查询参数**：
- `status` - 按状态过滤
- `search` - 搜索关键词
- `courierId` - 按快递员过滤
- `recipientPhone` - 按收件人手机号过滤

**权限**：需要认证
- USER 角色：只返回自己的快递
- COURIER 角色：只返回自己负责的快递
- ADMIN 角色：返回所有快递

**响应**：
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "trackingNumber": "SF202401010001",
      "recipientName": "用户张三",
      "status": "IN_STORAGE",
      "pickupCode": "A1B2C3",
      "storageLocation": "A区-1号柜"
    }
  ]
}
```

#### POST /api/packages

**描述**：创建快递（快递入库）

**请求体**：
```json
{
  "trackingNumber": "SF202401010004",
  "recipientName": "李四",
  "recipientPhone": "13800000004",
  "storageLocation": "B区-2号柜",
  "notes": "请尽快取件"
}
```

**权限**：COURIER 或 ADMIN 角色

**响应**：
```json
{
  "success": true,
  "data": {
    "id": "...",
    "pickupCode": "X9Y8Z7"
  },
  "message": "入库成功"
}
```

#### POST /api/packages/pickup

**描述**：取件

**请求体**：
```json
{
  "pickupCode": "A1B2C3",
  "packageId": "..."
}
```

**响应**：
```json
{
  "success": true,
  "message": "取件成功"
}
```

### 取件记录 API

#### GET /api/pickups

**描述**：获取取件历史

**权限**：需要认证

### 用户 API

#### GET /api/users

**描述**：获取用户列表

**权限**：仅 ADMIN 角色

**查询参数**：
- `role` - 按角色过滤
- `search` - 搜索关键词

### 统计 API

#### GET /api/stats

**描述**：获取统计数据

**权限**：仅 ADMIN 角色

**响应**：
```json
{
  "success": true,
  "data": {
    "totalPackages": 100,
    "pendingPackages": 20,
    "pickedUpToday": 15,
    "activeUsers": 50,
    "weeklyData": [...],
    "statusDistribution": {...}
  }
}
```

## 认证与权限

### 用户角色

| 角色 | 权限 |
|------|------|
| USER | 用户功能：查看快递、取件、查看历史 |
| COURIER | 用户功能 + 快递员功能：查看派件、入库 |
| ADMIN | 所有功能 + 管理员功能：数据概览、管理快递和用户 |

### 认证流程

```
1. 用户访问受保护页面
   ↓
2. 中间件检查 Cookie 中的 auth_token
   ↓
3. 无 token → 重定向到 /login
   ↓
4. 有 token → 解析 token 获取用户信息
   ↓
5. 验证用户角色是否有访问权限
   ↓
6. 权限验证通过 → 放行请求
   ↓
7. 权限不足 → 重定向到 /login
```

### 安全特性

1. **密码安全**：使用 bcryptjs 进行密码加密，salt rounds = 12
2. **会话安全**：
   - 使用 HTTP Only Cookie（防止 XSS）
   - Cookie 设置 SameSite = Lax
   - 开发环境 Secure = false，生产环境应设为 true
3. **输入验证**：
   - 手机号格式验证
   - 运单号格式验证
   - 必需字段验证
4. **权限控制**：基于角色的访问控制（RBAC）
5. **SQL 注入防护**：使用 Prisma ORM 参数化查询

## 部署指南

### 开发环境

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# 数据库（开发环境使用 SQLite）
DATABASE_URL="file:./dev.db"

# JWT 密钥（生产环境请使用强密钥）
JWT_SECRET="your-secret-key-change-in-production-please-use-a-strong-secret-key-here"
```

#### 3. 初始化数据库

```bash
npm run db:setup
```

这个命令会：
- 生成 Prisma Client
- 推送数据库 schema
- 运行 seed 脚本（创建测试数据）

#### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

#### 5. 测试账号

| 角色 | 手机号 | 密码 |
|------|--------|------|
| 管理员 | 13800000000 | admin123 |
| 快递员 | 13800000001 | courier123 |
| 用户 | 13800000002 | user123 |

### 生产环境部署

#### 1. 构建生产版本

```bash
npm run build
```

#### 2. 配置生产环境

确保在生产环境中：
- 使用生产级数据库（PostgreSQL/MySQL）
- 设置强 JWT_SECRET
- 设置 NODE_ENV=production
- Cookie Secure=true

#### 3. 启动生产服务器

```bash
npm start
```

## 常见问题

### Q: 登录后还是跳回登录页面？

**A**: 
1. 清除浏览器 Cookie（F12 > Application > Cookies）
2. 确保使用的是新 token（当前使用简单的 base64 token）
3. 查看开发服务器日志，确认中间件的 token 解析结果

### Q: 如何重置数据库？

**A**:
```bash
# 删除旧数据库
rm prisma/dev.db

# 重新初始化
npm run db:setup
```

### Q: 当前为什么使用简单的 base64 token 而不是 JWT？

**A**:
- 为了调试方便，快速定位问题
- 生产环境建议恢复 JWT，因为 JWT 提供：
  - 签名验证（防篡改）
  - 过期时间验证
  - 更好的安全性

恢复 JWT 的方法：编辑 `src/lib/session.ts`，取消注释 jwt.sign 和 jwt.verify 相关代码。

### Q: 如何添加新的功能页面？

**A**:
1. 在 `src/app/` 下创建新页面目录
2. 在 `middleware.ts` 中配置路由权限
3. 如有需要，创建对应的 API 路由

### Q: 如何修改用户角色？

**A**:
目前只能通过数据库直接修改，或在种子脚本中设置。可以开发管理员修改用户角色的功能。

## 开发建议

1. **代码风格**：遵循 ESLint 规则，运行 `npm run lint` 检查
2. **TypeScript**：始终使用类型注解，避免 any 类型
3. **数据库操作**：使用 Prisma Client，不要直接写 SQL
4. **提交规范**：每次完成功能节点后，进行 Git 提交
5. **测试**：建议添加单元测试和 E2E 测试

## 技术债务与改进项

1. **安全**：
   - 恢复 JWT 认证（当前使用简单 token 是为了调试）
   - 添加 CSRF 防护
   - 添加请求限流

2. **功能**：
   - 添加用户修改密码功能
   - 添加邮箱验证
   - 添加通知功能
   - 添加快递状态更新和流转记录

3. **体验**：
   - 添加加载动画
   - 添加错误提示优化
   - 添加响应式优化

4. **测试**：
   - 添加单元测试
   - 添加 E2E 测试
   - 添加集成测试

## 许可证

MIT
