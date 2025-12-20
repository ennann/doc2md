# Next.js 升级 & Cloudflare Pages 迁移指南

> 本文档详细说明如何将 doc2md 前端项目从 Vercel 迁移到 Cloudflare Pages，并升级 Next.js/React 到最新版本。

## 目录

1. [项目现状分析](#1-项目现状分析)
2. [可行性评估](#2-可行性评估)
3. [迁移方案选择](#3-迁移方案选择)
4. [详细迁移步骤](#4-详细迁移步骤)
5. [配置文件修改](#5-配置文件修改)
6. [Cloudflare Pages 配置](#6-cloudflare-pages-配置)
7. [GitHub Actions 更新](#7-github-actions-更新)
8. [测试与验证](#8-测试与验证)
9. [回滚方案](#9-回滚方案)
10. [常见问题](#10-常见问题)

---

## 1. 项目现状分析

### 1.1 当前技术栈

| 技术 | 当前版本 | 最新版本 |
|------|----------|----------|
| Next.js | ^15.0.0 | 16.1.0 |
| React | ^19.0.0 | 19.2.3 |
| TypeScript | ^5.3.0 | 5.7.x |
| Tailwind CSS | ^3.4.0 | 3.4.x |
| Node.js | >=18.0.0 | 22.x LTS |

### 1.2 项目结构

```
apps/frontend/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx      # 国际化布局
│   │   │   ├── page.tsx        # 主页（文件上传）
│   │   │   ├── privacy/page.tsx
│   │   │   └── support/page.tsx
│   │   ├── layout.tsx          # 根布局
│   │   ├── globals.css
│   │   └── sitemap.ts          # 动态 sitemap
│   ├── components/             # React 组件
│   ├── lib/                    # 工具函数
│   ├── locales/                # 国际化文件 (11 种语言)
│   └── types/
├── public/                     # 静态资源
├── next.config.ts
└── package.json
```

### 1.3 使用的 Next.js 功能

| 功能 | 使用情况 | CF Pages 兼容性 |
|------|----------|-----------------|
| App Router | ✅ 使用 | ✅ 支持 |
| Server Components | ✅ 使用 | ✅ 支持（静态导出） |
| Client Components (`'use client'`) | ✅ 使用 | ✅ 支持 |
| `generateStaticParams` | ✅ 使用 | ✅ 支持 |
| `generateMetadata` | ✅ 使用 | ✅ 支持 |
| `next/font/google` | ✅ 使用 | ✅ 支持 |
| `next/link` & `next/script` | ✅ 使用 | ✅ 支持 |
| API Routes | ❌ 未使用 | N/A |
| Middleware | ❌ 未使用 | N/A |
| ISR (增量静态再生) | ❌ 未使用 | N/A |
| Image Optimization | ❌ 未使用 | N/A |
| `next.config.ts` redirects | ✅ 使用 | ⚠️ 需迁移到 `_redirects` |
| `next.config.ts` headers | ✅ 使用 | ⚠️ 需迁移到 `_headers` |

---

## 2. 可行性评估

### 2.1 Next.js 升级评估

#### Next.js 15.x → 16.x 主要变化

1. **Turbopack 成为默认 bundler** - 构建速度提升 2-5 倍
2. **Async APIs** - `params`, `searchParams`, `cookies()`, `headers()` 现在是异步的
   - ✅ 项目已使用 `await params`，无需修改
3. **Middleware 重命名为 Proxy** - `middleware.ts` → `proxy.ts`
   - ✅ 项目未使用 Middleware，无影响
4. **Node.js 最低版本要求** - 需要 Node.js 20.9.0+
5. **已知问题** - Next.js 16.0.x 静态导出存在 prefetch 404 bug

#### 升级建议

| 选项 | 推荐度 | 说明 |
|------|--------|------|
| 升级到 Next.js 15.x 最新版 | ⭐⭐⭐⭐⭐ | 稳定，兼容性好 |
| 升级到 Next.js 16.x | ⭐⭐⭐ | 有 bug，等待修复 |

**结论**: 建议先升级到 **Next.js 15.x 最新版**，待 16.x 修复静态导出 bug 后再考虑升级。

### 2.2 Cloudflare Pages 迁移评估

#### 迁移可行性: ✅ 高度可行

原因:
- 项目结构非常简单（3 个页面）
- 使用 `generateStaticParams` 进行静态生成
- 没有使用 API Routes（后端是独立的 Python 服务）
- 没有使用 Middleware
- 没有使用 ISR 或动态功能

#### 部署方案对比

| 方案 | 复杂度 | 功能支持 | 推荐度 |
|------|--------|----------|--------|
| **静态导出 + CF Pages** | 低 | 静态站点 | ⭐⭐⭐⭐⭐ |
| OpenNext + CF Workers | 中 | 完整 SSR | ⭐⭐⭐ |
| @cloudflare/next-on-pages | - | - | ❌ 已弃用 |

**结论**: 推荐使用 **静态导出 + Cloudflare Pages**，最简单且完全满足需求。

---

## 3. 迁移方案选择

### 推荐方案: 静态导出 (Static Export)

```
Next.js (output: 'export') → 静态 HTML/CSS/JS → Cloudflare Pages
```

#### 优势
- ✅ 配置简单
- ✅ 构建速度快
- ✅ 无需 Workers（无大小限制）
- ✅ 全球 CDN 分发
- ✅ 免费计划额度充足
- ✅ 自动 HTTPS

#### 限制（对本项目无影响）
- ❌ 不支持 ISR
- ❌ 不支持 API Routes
- ❌ 不支持动态路由（无 `generateStaticParams`）
- ❌ 不支持 Image Optimization

---

## 4. 详细迁移步骤

### 4.1 创建迁移分支

```bash
git checkout main
git pull origin main
git checkout -b feature/cloudflare-migration
```

### 4.2 升级依赖

```bash
cd apps/frontend

# 更新 Next.js 到 15.x 最新版
pnpm update next@^15

# 更新 React 到最新版
pnpm update react react-dom @types/react @types/react-dom

# 更新其他依赖
pnpm update
```

### 4.3 更新根目录 package.json

```bash
cd ../..

# 更新 Node.js 版本要求
# engines.node: ">=20.9.0"
```

### 4.4 验证本地构建

```bash
pnpm build
pnpm start
```

---

## 5. 配置文件修改

### 5.1 修改 `next.config.ts`

**修改前:**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**修改后:**

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // redirects 和 headers 移至 public/_redirects 和 public/_headers
};

export default nextConfig;
```

### 5.2 创建 `public/_redirects`

```
# Cloudflare Pages Redirects
# https://developers.cloudflare.com/pages/configuration/redirects/

# 根路径重定向到英文版
/  /en/  302
```

### 5.3 创建 `public/_headers`

```
# Cloudflare Pages Headers
# https://developers.cloudflare.com/pages/configuration/headers/

/sitemap.xml
  Content-Type: application/xml

/robots.txt
  Content-Type: text/plain

# 安全响应头
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

### 5.4 处理 sitemap.ts

由于静态导出不支持动态 sitemap，需要将 `src/app/sitemap.ts` 改为构建时生成静态文件。

**方案 A: 保留动态生成（推荐）**

Next.js 静态导出会在构建时执行 `sitemap.ts` 并生成 `/sitemap.xml`。

验证: 构建后检查 `out/sitemap.xml` 是否正确生成。

**方案 B: 使用静态 sitemap**

如果方案 A 不工作，可以使用构建脚本生成静态 sitemap：

```bash
# 在 package.json scripts 中添加
"postbuild": "node scripts/generate-sitemap.js"
```

### 5.5 验证 generateStaticParams

确保所有动态路由都有对应的 `generateStaticParams`:

```typescript
// src/app/[locale]/layout.tsx
export async function generateStaticParams(): Promise<{ locale: Locale }[]> {
  return [
    { locale: 'en' as Locale },
    { locale: 'zh-cn' as Locale },
    { locale: 'zh-hk' as Locale },
    { locale: 'zh-tw' as Locale },
    { locale: 'ja' as Locale },
    { locale: 'fr' as Locale },
    { locale: 'de' as Locale },
    { locale: 'es' as Locale },
    { locale: 'pt-br' as Locale },
    { locale: 'ko' as Locale },
    { locale: 'it' as Locale },
  ];
}
```

---

## 6. Cloudflare Pages 配置

### 6.1 创建 Cloudflare Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 选择 GitHub 仓库 `ennann/doc2md`

### 6.2 构建配置

| 设置 | 值 |
|------|-----|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `cd apps/frontend && pnpm install && pnpm build` |
| Build output directory | `apps/frontend/out` |
| Root directory | `/` (保持默认) |

### 6.3 环境变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_VERSION` | `20` | Node.js 版本 |
| `NEXT_PUBLIC_API_URL` | `https://api.doc2md.org` | 后端 API 地址 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXX` | Google Analytics ID |

### 6.4 自定义域名

1. 进入 Pages 项目设置
2. **Custom domains** → **Set up a custom domain**
3. 添加域名: `doc2md.org` 和 `www.doc2md.org`
4. 按提示配置 DNS（使用 Cloudflare DNS 会自动配置）

---

## 7. GitHub Actions 更新

### 7.1 新建 `.github/workflows/deploy-cf-pages.yml`

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Install dependencies
        run: pnpm install
        working-directory: apps/frontend

      - name: Build
        run: pnpm build
        working-directory: apps/frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_GA_MEASUREMENT_ID: ${{ secrets.NEXT_PUBLIC_GA_MEASUREMENT_ID }}

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: doc2md
          directory: apps/frontend/out
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 7.2 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets:

| Secret 名称 | 获取方式 |
|-------------|----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard URL 中的 Account ID |
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 测量 ID |

### 7.3 API Token 权限

创建 API Token 时选择以下权限:
- **Account** → Cloudflare Pages → Edit
- **Zone** → Zone → Read (可选，用于自定义域名)

---

## 8. 测试与验证

### 8.1 本地测试

```bash
cd apps/frontend

# 构建静态导出
pnpm build

# 验证输出目录
ls -la out/

# 本地预览（需要安装 serve）
npx serve out -p 3000
```

### 8.2 验证清单

- [ ] 所有语言版本页面正常访问 (`/en/`, `/zh-cn/`, `/ja/`, etc.)
- [ ] 根路径 `/` 正确重定向到 `/en/`
- [ ] 隐私政策页面 `/en/privacy/` 正常
- [ ] 支持页面 `/en/support/` 正常
- [ ] 文件上传功能正常（连接后端 API）
- [ ] `sitemap.xml` 正确生成
- [ ] `robots.txt` 正确提供
- [ ] Google Analytics 正常工作
- [ ] 响应头正确设置（`_headers` 生效）
- [ ] 自定义域名正常解析
- [ ] HTTPS 证书正常

### 8.3 性能对比

| 指标 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| TTFB (首字节时间) | ~100ms | ~50ms |
| 全球 CDN 节点 | 有限 | 300+ |
| 免费带宽 | 100GB/月 | 无限 |
| 免费请求数 | 无限 | 无限 |

---

## 9. 回滚方案

### 9.1 快速回滚

如果迁移出现问题，可以快速回滚:

1. **DNS 回滚**: 将域名 DNS 指向 Vercel
2. **代码回滚**: `git revert` 迁移相关 commits

### 9.2 并行运行

建议迁移期间并行运行两个环境:

1. `doc2md.org` → Vercel (现有)
2. `preview.doc2md.org` → Cloudflare Pages (新)

验证无误后再切换 DNS。

---

## 10. 常见问题

### Q1: 静态导出后 sitemap.ts 不工作?

**A**: 确保 `sitemap.ts` 返回的是 `MetadataRoute.Sitemap` 类型。Next.js 会在构建时执行并生成静态 XML 文件。

### Q2: Google Fonts 加载失败?

**A**: 静态导出时 `next/font/google` 会将字体内联到 CSS 中，应该正常工作。如有问题，检查构建日志。

### Q3: 图片无法显示?

**A**: 静态导出不支持 Image Optimization，需要设置 `images: { unoptimized: true }`。

### Q4: 环境变量不生效?

**A**: 客户端环境变量必须以 `NEXT_PUBLIC_` 开头，且在构建时注入。确保在 Cloudflare Pages 构建设置中配置。

### Q5: 构建时间过长?

**A**:
- 使用 `pnpm` 代替 `npm` 可加速依赖安装
- 启用 Cloudflare Pages 构建缓存
- 考虑升级到 Next.js 16 使用 Turbopack（待 bug 修复）

### Q6: 自定义域名 SSL 证书问题?

**A**: Cloudflare Pages 自动提供 SSL 证书。如使用其他 DNS，需手动配置证书或使用 Cloudflare DNS。

---

## 参考资料

- [Next.js Static Exports](https://nextjs.org/docs/pages/guides/static-exports)
- [Cloudflare Pages - Static Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/)
- [Cloudflare Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages Headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Next.js 16 升级指南](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) (备选方案)

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2025-12-20 | 1.0.0 | 初始版本 |
