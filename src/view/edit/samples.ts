export interface MarkdownFile {
  id: string
  name: string
  content: string
}

export interface Version {
  id: string
  fileId: string
  name: string
  note: string
  content: string
  published: boolean
  createdAt: number
}

export const sampleFiles: MarkdownFile[] = [
  {
    id: 'sample-guide',
    name: '项目指南.md',
    content: `# 项目指南

## 简介

欢迎使用 AuzelWeb！这是一个基于 **Vue 3** + **TypeScript** + **Tailwind CSS v4** 的现代化 Web 应用模板。

## 快速开始

### 安装依赖

\`\`\`bash
pnpm install
\`\`\`

### 启动开发服务器

\`\`\`bash
pnpm dev
\`\`\`

### 构建生产版本

\`\`\`bash
pnpm build
\`\`\`

## 项目结构

\`\`\`
src/
├── assets/        # 静态资源与全局样式
├── components/    # 可复用的 UI 组件
├── layout/        # 布局组件
├── lib/           # 工具函数
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
└── view/          # 页面组件
\`\`\`

## 技术栈

| 技术 | 用途 |
|------|------|
| Vue 3 | 前端框架 |
| TypeScript | 类型安全 |
| Tailwind CSS v4 | 样式方案 |
| Pinia | 状态管理 |
| Vue Router | 路由管理 |
| Inspira UI | UI 组件与动效 |

## 特性

- 支持 **亮色/暗色** 主题切换
- 响应式侧边栏布局
- CodeMirror 6 集成，提供强大的编辑体验
- 实时 Markdown 预览
- 代码语法高亮

> **提示**：编辑页面支持上传本地的 Markdown 文件进行编辑和预览。

`,
  },
  {
    id: 'sample-code',
    name: '代码示例.md',
    content: `# 代码示例

下面是一些常见的代码片段示例，展示了不同编程语言的语法高亮效果。

## JavaScript

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// 生成斐波那契数列
const fibSequence = Array.from({ length: 10 }, (_, i) => fibonacci(i))
console.log('前 10 个斐波那契数:', fibSequence)

// 使用 async/await
async function fetchData(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }
    return await response.json()
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}
\`\`\`

## TypeScript

\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

type ApiResponse<T> = {
  data: T
  status: number
  message: string
}

class UserService {
  private users: Map<number, User> = new Map()

  async getUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch('/api/users')
    const data = await response.json()
    return {
      data,
      status: response.status,
      message: 'success',
    }
  }

  getUserById(id: number): User | undefined {
    return this.users.get(id)
  }
}
\`\`\`

## Python

\`\`\`python
import asyncio
from typing import Optional


class DataProcessor:
    """数据处理基类"""

    def __init__(self, name: str):
        self.name = name
        self.data: list[dict] = []

    async def load_data(self, source: str) -> None:
        # 模拟异步数据加载
        await asyncio.sleep(1)
        self.data = [{"id": 1, "value": "test"}]

    def transform(self, func) -> list:
        return [func(item) for item in self.data]


async def main():
    processor = DataProcessor("example")
    await processor.load_data("local")
    result = processor.transform(lambda x: x["value"])
    print(f"处理结果: {result}")


if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## Vue

\`\`\`vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Todo {
  id: number
  text: string
  completed: boolean
}

const todos = ref<Todo[]>([])
const input = ref('')

const completedCount = computed(() =>
  todos.value.filter(t => t.completed).length
)

function addTodo() {
  if (!input.value.trim()) return
  todos.value.push({
    id: Date.now(),
    text: input.value,
    completed: false,
  })
  input.value = ''
}

function toggleTodo(id: number) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}
</script>
\`\`\`

## CSS

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
\`\`\`

## Bash

\`\`\`bash
#!/bin/bash

# 部署脚本
set -euo pipefail

APP_NAME="auzelweb"
BUILD_DIR="./dist"
REMOTE_USER="deploy"
REMOTE_HOST="example.com"
REMOTE_PATH="/var/www/\${APP_NAME}"

echo "🏗️  构建应用..."
pnpm build

echo "📦 打包构建产物..."
tar -czf deploy.tar.gz -C \${BUILD_DIR} .

echo "🚀 部署到服务器..."
scp deploy.tar.gz \${REMOTE_USER}@\${REMOTE_HOST}:\${REMOTE_PATH}/
ssh \${REMOTE_USER}@\${REMOTE_HOST} "cd \${REMOTE_PATH} && tar -xzf deploy.tar.gz && rm deploy.tar.gz"

echo "✅ 部署完成！"
rm deploy.tar.gz
\`\`\`

## Rust

\`\`\`rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Config {
    host: String,
    port: u16,
    database: DatabaseConfig,
}

#[derive(Debug, Clone)]
struct DatabaseConfig {
    url: String,
    max_connections: u32,
}

impl Config {
    fn from_env() -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Config {
            host: std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".into()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".into())
                .parse()?,
            database: DatabaseConfig {
                url: std::env::var("DATABASE_URL")?,
                max_connections: 10,
            },
        })
    }
}
\`\`\`

## 内联代码

行内代码示例：\`const greeting = "Hello, World!"\` 和 \`console.log(greeting)\`。

## 数学公式

行内公式：$E = mc^2$，块级公式：

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$
`,
  },
  {
    id: 'sample-notes',
    name: '笔记模板.md',
    content: `# 📝 会议笔记模板

**日期**：2025-01-15
**参与者**：张三、李四、王五
**主题**：Q1 项目规划

---

## 议程

1. 回顾上季度目标完成情况
2. 讨论 Q1 重点项目
3. 资源分配与时间线
4. 风险评估

## 讨论要点

### 1. 上季度回顾

- ✅ 完成了核心模块的重构
- ✅ 上线了新版用户中心
- ⏳ 性能优化进行中（预计延迟 2 周）
- ❌ 自动化测试覆盖率未达标

### 2. Q1 重点项目

| 项目 | 优先级 | 负责人 | 截止日期 |
|------|--------|--------|----------|
| 搜索功能优化 | P0 | 张三 | 02-15 |
| 移动端适配 | P1 | 李四 | 03-01 |
| 国际化支持 | P2 | 王五 | 03-15 |
| 性能监控系统 | P1 | 团队 | 03-30 |

### 3. 资源分配

> **关键决策**：前端团队将全力支持搜索功能优化，后端团队并行推进性能监控系统。

- **设计资源**：每周二、四下午支持
- **QA 资源**：需提前 3 天预约
- **运维支持**：24/7 待命，部署需提前通知

### 4. 风险评估

1. **技术风险**：搜索索引重建可能影响线上性能
   - 缓解方案：低峰期执行，灰度发布
2. **时间风险**：移动端适配与国际化并行开发
   - 缓解方案：增加一名兼职前端支持

## 行动项

- [ ] 张三：本周五前输出搜索功能技术方案
- [ ] 李四：下周一前完成移动端适配原型
- [ ] 王五：协调翻译资源，周三确认语言包格式
- [ ] 所有人：周五前阅读性能监控系统设计文档

## 备注

下次会议时间：**2025-01-22 14:00**
需要提前准备：
1. 各项目的最新进度报告
2. 性能优化方案的初步数据

---

*会议记录由 AI 助手自动生成*
`,
  },
]
