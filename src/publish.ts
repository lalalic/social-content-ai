// Quick publish — generate today's content for all platforms
import { ContentGenerator } from './generator';
import { STRATEGIES, HASHTAG_SETS } from './strategies';
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

function loadApiKey(): string {
  const envPath = path.resolve(__dirname, '../../../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/openai\.apiKey=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('OpenAI API key not found');
}

async function main() {
  const apiKey = loadApiKey();
  const generator = new ContentGenerator(apiKey);
  const today = dayjs().format('YYYY-MM-DD');
  const dayOfWeek = dayjs().day(); // 0=Sun, 1=Mon...

  // Content themes by day of week
  const themes = [
    { topic: '周末招聘小知识：面试中最常犯的3个错误', platforms: ['xiaohongshu'] as const, type: 'post' as const },
    { topic: 'HireFlow新功能上线：AI一键生成个性化外联消息', platforms: ['twitter', 'linkedin'] as const, type: 'post' as const },
    { topic: 'React Native + AI 独立开发经验分享', platforms: ['twitter'] as const, type: 'thread' as const },
    { topic: 'AI招聘趋势：2026年企业如何用AI提升招聘效率', platforms: ['linkedin', 'wechat'] as const, type: 'post' as const },
    { topic: 'HireFlow使用教程：5分钟上手AI候选人评分', platforms: ['xiaohongshu'] as const, type: 'tutorial' as const },
    { topic: '从0到1000用户：独立开发者产品增长实战', platforms: ['twitter', 'xiaohongshu'] as const, type: 'post' as const },
    { topic: 'HireFlow本周更新总结 + 下周路线图', platforms: ['twitter', 'linkedin'] as const, type: 'post' as const },
  ];

  const todayTheme = themes[dayOfWeek];
  
  console.log(`\n📅 ${today} 内容生成\n`);
  console.log(`📌 主题: ${todayTheme.topic}`);
  console.log(`📱 平台: ${todayTheme.platforms.join(', ')}\n`);

  const results: { platform: string; content: string }[] = [];

  for (const platform of todayTheme.platforms) {
    console.log(`⏳ 生成 ${platform} 内容...`);
    try {
      const result = await generator.generate({
        topic: todayTheme.topic,
        platform,
        type: todayTheme.type,
        language: 'zh',
        brandVoice: 'professional yet approachable, data-driven, passionate about AI and recruiting',
        includeHashtags: true,
        includeCTA: true,
      });
      results.push({ platform, content: result.content });
      console.log(`   ✅ ${platform} 完成 (${result.content.length} chars)\n`);
    } catch (err: any) {
      console.log(`   ❌ ${platform} 失败: ${err.message}\n`);
    }
  }

  // Save to file
  const outDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, `today_${today}.md`);
  let md = `# ${today} 社交媒体内容\n\n主题: ${todayTheme.topic}\n\n`;
  
  for (const { platform, content } of results) {
    md += `---\n\n## ${platform.toUpperCase()}\n\n`;
    md += `\`\`\`\n${content}\n\`\`\`\n\n`;
    md += `**复制以上内容直接发布到 ${platform}**\n\n`;
  }

  md += `---\n\n> 使用 HireFlow Social Content AI 自动生成\n`;
  md += `> GitHub: https://github.com/lalalic/social-content-ai\n`;

  fs.writeFileSync(outFile, md, 'utf-8');
  console.log(`\n📁 已保存到 ${outFile}`);
  console.log(`\n✅ 今日 ${results.length} 条内容已生成，可直接复制发布！`);
}

main().catch(console.error);
