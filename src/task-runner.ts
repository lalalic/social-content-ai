// Task Runner — Execute and manage marketing tasks
import { loadTasks, addTask, updateTask, getNextTask, printTaskBoard, seedInitialTasks, getPendingTasks } from './tasks';
import { ContentGenerator } from './generator';
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

async function executeContentTask(task: any) {
  const generator = new ContentGenerator(loadApiKey());
  const outDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const today = dayjs().format('YYYY-MM-DD');

  if (task.tags?.includes('daily')) {
    // Generate daily content
    const platforms = ['twitter', 'linkedin'] as const;
    const results: string[] = [];
    
    for (const platform of platforms) {
      const result = await generator.generate({
        topic: 'HireFlow AI招聘助手 — 今日分享',
        platform,
        type: 'post',
        language: 'zh',
        brandVoice: 'professional, data-driven, passionate about AI recruiting',
        includeHashtags: true,
        includeCTA: true,
      });
      results.push(`## ${platform.toUpperCase()}\n\n${result.content}`);
    }
    
    const outFile = path.join(outDir, `daily_${today}.md`);
    fs.writeFileSync(outFile, `# Daily Content — ${today}\n\n${results.join('\n\n---\n\n')}\n`, 'utf-8');
    return outFile;
  }

  if (task.tags?.includes('video')) {
    const result = await generator.generate({
      topic: 'HireFlow AI智能招聘助手30秒产品介绍',
      platform: 'douyin',
      type: 'video_script',
      language: 'zh',
      brandVoice: 'energetic, professional, solution-focused',
      includeCTA: true,
    });
    
    const outFile = path.join(outDir, `video_script_${today}.md`);
    fs.writeFileSync(outFile, `# Video Script — ${today}\n\n${result.content}\n`, 'utf-8');
    return outFile;
  }

  if (task.tags?.includes('article')) {
    const result = await generator.generate({
      topic: '2026年AI招聘趋势深度分析：智能招聘如何改变行业格局',
      platform: 'wechat',
      type: 'post',
      language: 'zh',
      brandVoice: 'analytical, insightful, industry-expert',
      includeCTA: true,
    });
    
    const outFile = path.join(outDir, `article_${today}.md`);
    fs.writeFileSync(outFile, `# AI Recruiting Analysis — ${today}\n\n${result.content}\n`, 'utf-8');
    return outFile;
  }

  return null;
}

async function main() {
  const command = process.argv[2] || 'board';

  switch (command) {
    case 'seed':
      seedInitialTasks();
      printTaskBoard();
      break;

    case 'board':
    case 'status':
      printTaskBoard();
      break;

    case 'next': {
      const task = getNextTask();
      if (!task) {
        console.log('\n✨ No pending tasks! All caught up.');
        break;
      }
      console.log(`\n📌 Next task: [${task.priority}] ${task.title}`);
      console.log(`   ${task.description}`);
      console.log(`   Category: ${task.category} | Tags: ${task.tags?.join(', ') || 'none'}`);
      break;
    }

    case 'run': {
      // Auto-execute the next content task
      const task = getNextTask();
      if (!task) {
        console.log('\n✨ No pending tasks!');
        break;
      }
      
      console.log(`\n▶️  Executing: ${task.title}`);
      updateTask(task.id, { status: 'in-progress' });
      
      try {
        if (task.category === 'content') {
          const output = await executeContentTask(task);
          if (output) {
            updateTask(task.id, { status: 'completed', output });
            console.log(`   ✅ Completed! Output: ${output}`);
          } else {
            updateTask(task.id, { status: 'completed' });
            console.log(`   ✅ Completed (no output file)`);
          }
        } else {
          console.log(`   ⚠️  Task category "${task.category}" requires manual execution.`);
          console.log(`   📝 ${task.description}`);
          updateTask(task.id, { status: 'pending' }); // Keep pending
        }
      } catch (err: any) {
        updateTask(task.id, { status: 'failed', output: err.message });
        console.log(`   ❌ Failed: ${err.message}`);
      }
      
      console.log();
      printTaskBoard();
      break;
    }

    case 'run-all': {
      // Execute ALL pending content tasks
      const pending = getPendingTasks().filter(t => t.category === 'content');
      if (pending.length === 0) {
        console.log('\n✨ No pending content tasks!');
        break;
      }
      
      console.log(`\n🚀 Running ${pending.length} content tasks...\n`);
      
      for (const task of pending) {
        console.log(`▶️  ${task.title}`);
        updateTask(task.id, { status: 'in-progress' });
        
        try {
          const output = await executeContentTask(task);
          updateTask(task.id, { status: 'completed', output: output || undefined });
          console.log(`   ✅ Done${output ? ` → ${output}` : ''}\n`);
        } catch (err: any) {
          updateTask(task.id, { status: 'failed', output: err.message });
          console.log(`   ❌ Failed: ${err.message}\n`);
        }
      }
      
      printTaskBoard();
      break;
    }

    case 'add': {
      const title = process.argv[3];
      const category = (process.argv[4] || 'content') as any;
      const priority = (process.argv[5] || 'medium') as any;
      
      if (!title) {
        console.log('Usage: task add "title" [category] [priority]');
        break;
      }
      
      const task = addTask({
        title,
        description: title,
        category,
        priority,
        tags: [],
      });
      
      console.log(`\n✅ Added: ${task.title} [${task.priority}]`);
      break;
    }

    case 'complete': {
      const id = process.argv[3];
      if (!id) {
        console.log('Usage: task complete <task_id>');
        break;
      }
      const updated = updateTask(id, { status: 'completed' });
      if (updated) {
        console.log(`\n✅ Completed: ${updated.title}`);
      } else {
        console.log(`\n❌ Task not found: ${id}`);
      }
      break;
    }

    default:
      console.log(`
📋 Task Manager — HireFlow Marketing Automation

Commands:
  seed      Initialize with default marketing tasks
  board     Show task board (default)
  next      Show next task to execute
  run       Auto-execute next content task
  run-all   Execute all pending content tasks
  add       Add a new task: add "title" [category] [priority]
  complete  Mark task done: complete <task_id>
`);
  }
}

main().catch(console.error);
