# Social Content AI

AI-powered social media content generator for HireFlow marketing.

## 功能 / Features

- 🤖 智能生成社交媒体内容（支持中英文）
- 📱 支持多平台：Twitter/X、LinkedIn、微信公众号、小红书、抖音
- 📅 自动生成内容日历
- 📝 多种内容类型：帖子、线程、视频脚本、教程、故事
- 🏷️ 自动添加相关话题标签
- 📊 内置HireFlow营销策略模板

## 快速开始 / Quick Start

```bash
# 安装依赖
npm install

# 生成一条推文
npm run dev -- post "AI招聘的未来" twitter zh

# 批量生成HireFlow推广内容
npm run dev -- batch hireflow_launch

# 生成一周内容计划
npm run dev -- weekly "AI招聘"

# 查看内容日历
npm run dev -- calendar 4

# 一键生成多平台推广内容
npm run generate

# 查看所有策略
npm run dev -- strategies
```

## 内置策略 / Strategies

1. **hireflow_launch** — HireFlow产品发布推广
2. **ai_recruiting_education** — AI招聘知识分享
3. **tech_building** — 技术创业分享
4. **video_content** — 短视频内容策划

## 输出 / Output

生成的内容保存在 `output/` 目录：
- JSON文件：结构化数据，可直接API发布
- Markdown文件：可读格式，方便复制粘贴

## API Key

使用父目录的 `.env.local` 中的 `openai.apiKey`。
