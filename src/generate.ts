// Quick content generation script — generates HireFlow marketing content immediately
import * as fs from 'fs';
import * as path from 'path';
import { ContentGenerator, type GeneratedContent } from './generator';
import { STRATEGIES } from './strategies';

function loadApiKey(): string {
  const envPath = path.resolve(__dirname, '../../../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/openai\.apiKey=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('OpenAI API key not found');
}

async function generateNow() {
  console.log('\n🚀 Generating HireFlow marketing content...\n');
  
  const generator = new ContentGenerator(loadApiKey());
  const results: GeneratedContent[] = [];

  // Generate a mix of content for different platforms
  const posts = [
    {
      platform: 'twitter' as const,
      topic: '刚发布了HireFlow AI招聘助手！用AI替你筛选简历、评分候选人、生成外联消息。数据100%本地存储，保护隐私。免费使用10个联系人！',
      type: 'post' as const,
    },
    {
      platform: 'linkedin' as const,
      topic: 'AI如何改变招聘行业：从手动筛选到智能匹配的演变。结合HireFlow实践经验分享。',
      type: 'post' as const,
    },
    {
      platform: 'xiaohongshu' as const,
      topic: '推荐一款超好用的AI招聘工具！支持中英文、一键评分候选人、数据本地存储保护隐私',
      type: 'post' as const,
    },
    {
      platform: 'twitter' as const,
      topic: '独立开发者分享：从0到1用React Native + AI开发招聘App的经历',
      type: 'thread' as const,
    },
  ];

  for (const post of posts) {
    console.log(`📝 Generating ${post.platform} ${post.type}...`);
    const content = await generator.generate({
      ...post,
      language: 'zh',
      productName: 'HireFlow',
      productUrl: 'https://github.com/lalalic/hireflow',
      tone: 'educational',
      hashtags: true,
      includeEmoji: true,
    });
    results.push(content);
    console.log(`   ✅ Done (${content.metadata.wordCount} chars)\n`);
    await new Promise(r => setTimeout(r, 1000));
  }

  // Save all content
  const outDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const allContent = results.map(r => ({
    platform: r.platform,
    type: r.type,
    content: r.content,
    hashtags: r.hashtags,
    generatedAt: r.metadata.generatedAt,
  }));

  fs.writeFileSync(
    path.join(outDir, `batch_${new Date().toISOString().split('T')[0]}.json`),
    JSON.stringify(allContent, null, 2)
  );

  // Also save as readable markdown
  let markdown = `# HireFlow Marketing Content\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
  
  for (const content of results) {
    markdown += `## ${content.platform.toUpperCase()} — ${content.type}\n\n`;
    markdown += content.content + '\n\n';
    if (content.hashtags.length > 0) {
      markdown += `**Tags:** ${content.hashtags.join(' ')}\n\n`;
    }
    markdown += '---\n\n';
  }

  fs.writeFileSync(path.join(outDir, `content_${new Date().toISOString().split('T')[0]}.md`), markdown);

  console.log('━'.repeat(60));
  console.log(`\n✅ Generated ${results.length} pieces of content`);
  console.log(`📁 Saved to output/ directory`);
  console.log(`📄 Readable version: output/content_${new Date().toISOString().split('T')[0]}.md\n`);
}

generateNow().catch(console.error);
