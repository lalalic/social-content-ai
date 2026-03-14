// Social Content AI — Main CLI entry point
import * as fs from 'fs';
import * as path from 'path';
import { ContentGenerator, type Platform, type Language } from './generator';
import { STRATEGIES, generateContentCalendar, HASHTAG_SETS } from './strategies';

// Load API key from parent .env.local
function loadApiKey(): string {
  const envPath = path.resolve(__dirname, '../../../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    const match = content.match(/openai\.apiKey=(.+)/);
    if (match) return match[1].trim();
  }
  throw new Error('OpenAI API key not found. Set it in ../../.env.local as openai.apiKey=...');
}

async function main() {
  const command = process.argv[2] || 'help';
  
  switch (command) {
    case 'post': {
      const topic = process.argv[3] || 'AI招聘的未来趋势';
      const platform = (process.argv[4] || 'twitter') as Platform;
      const lang = (process.argv[5] || 'zh') as Language;

      console.log(`\n🚀 Generating ${platform} post about: ${topic}\n`);
      
      const generator = new ContentGenerator(loadApiKey());
      const content = await generator.generate({
        platform,
        type: 'post',
        topic,
        language: lang,
        productName: 'HireFlow',
        productUrl: 'https://github.com/lalalic/hireflow',
        tone: 'educational',
        hashtags: true,
        includeEmoji: true,
      });

      console.log('━'.repeat(60));
      console.log(`📱 Platform: ${platform}`);
      console.log(`🌐 Language: ${lang}`);
      console.log(`📝 Word Count: ${content.metadata.wordCount}`);
      console.log('━'.repeat(60));
      console.log(content.content);
      console.log('━'.repeat(60));
      if (content.hashtags.length > 0) {
        console.log(`🏷️  Hashtags: ${content.hashtags.join(' ')}`);
      }
      
      // Save to output
      saveContent(content);
      break;
    }

    case 'batch': {
      const strategyKey = process.argv[3] || 'hireflow_launch';
      const strategy = STRATEGIES[strategyKey];
      
      if (!strategy) {
        console.log(`Unknown strategy: ${strategyKey}`);
        console.log(`Available: ${Object.keys(STRATEGIES).join(', ')}`);
        return;
      }

      console.log(`\n📦 Generating batch content for: ${strategy.name}`);
      console.log(`   Topics: ${strategy.topics.length}`);
      console.log(`   Platforms: ${strategy.platforms.join(', ')}\n`);

      const generator = new ContentGenerator(loadApiKey());
      // Generate for first 3 topics across 2 platforms
      const topics = strategy.topics.slice(0, 3);
      const platforms = strategy.platforms.slice(0, 2) as Platform[];
      
      const results = await generator.generateBatch(topics, platforms, 'zh');
      
      for (const content of results) {
        console.log(`\n✅ ${content.platform} — ${content.metadata.topic.substring(0, 40)}...`);
        console.log(content.content.substring(0, 150) + '...\n');
        saveContent(content);
      }

      console.log(`\n📁 Generated ${results.length} pieces of content. Saved to output/`);
      break;
    }

    case 'weekly': {
      const niche = process.argv[3] || 'AI招聘';
      console.log(`\n📅 Generating weekly content plan for: ${niche}\n`);

      const generator = new ContentGenerator(loadApiKey());
      const weeklyContent = await generator.generateWeeklyPlan(niche, 'zh');

      for (const content of weeklyContent) {
        console.log(`📆 ${content.scheduledFor} | ${content.platform} | ${content.type}`);
        console.log(`   ${content.content.substring(0, 80)}...\n`);
        saveContent(content);
      }

      console.log(`\n✅ Generated ${weeklyContent.length} posts for the week`);
      break;
    }

    case 'calendar': {
      const weeks = parseInt(process.argv[3] || '4');
      const calendar = generateContentCalendar(weeks);
      
      console.log(`\n📅 Content Calendar (${weeks} weeks)\n`);
      console.log('Date       | Platform     | Strategy       | Topic');
      console.log('─'.repeat(80));
      
      for (const entry of calendar) {
        const topicShort = entry.topic.substring(0, 30).padEnd(30);
        console.log(`${entry.date} | ${entry.platform.padEnd(12)} | ${entry.strategy.substring(0, 14).padEnd(14)} | ${topicShort}`);
      }
      
      // Save calendar as JSON
      const outDir = path.resolve(__dirname, '../output');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(
        path.join(outDir, 'content-calendar.json'),
        JSON.stringify(calendar, null, 2)
      );
      console.log(`\n📁 Calendar saved to output/content-calendar.json`);
      break;
    }

    case 'strategies': {
      console.log('\n📋 Available Content Strategies:\n');
      for (const [key, strategy] of Object.entries(STRATEGIES)) {
        console.log(`  ${key}`);
        console.log(`    Name: ${strategy.name}`);
        console.log(`    Description: ${strategy.description}`);
        console.log(`    Topics: ${strategy.topics.length}`);
        console.log(`    Platforms: ${strategy.platforms.join(', ')}`);
        console.log(`    Target: ${strategy.targetAudience}`);
        console.log('');
      }
      break;
    }

    case 'hashtags': {
      console.log('\n🏷️  Hashtag Library:\n');
      for (const [category, tags] of Object.entries(HASHTAG_SETS)) {
        console.log(`  ${category}: ${tags.join(' ')}`);
      }
      break;
    }

    default:
      console.log(`
╔═══════════════════════════════════════════════════╗
║        Social Content AI — 社交媒体内容生成器       ║
╚═══════════════════════════════════════════════════╝

Usage:
  npm run dev -- post <topic> [platform] [language]
    Generate a single post
    Example: npm run dev -- post "AI招聘趋势" twitter zh

  npm run dev -- batch <strategy>
    Generate batch content for a strategy
    Example: npm run dev -- batch hireflow_launch

  npm run dev -- weekly <niche>
    Generate a week of content
    Example: npm run dev -- weekly "AI招聘"

  npm run dev -- calendar [weeks]
    Show content calendar
    Example: npm run dev -- calendar 4

  npm run dev -- strategies
    List available strategies

  npm run dev -- hashtags
    Show hashtag library

Platforms: twitter, linkedin, wechat, xiaohongshu, douyin
Languages: zh (Chinese), en (English), both
`);
  }
}

function saveContent(content: any) {
  const outDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const filename = `${content.platform}_${Date.now()}.json`;
  fs.writeFileSync(
    path.join(outDir, filename),
    JSON.stringify(content, null, 2)
  );
}

main().catch(console.error);
