// Task Management System — Automated marketing task execution
import * as fs from 'fs';
import * as path from 'path';
import dayjs from 'dayjs';

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'scheduled';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskCategory = 'content' | 'social' | 'product' | 'marketing' | 'dev' | 'analytics';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledAt?: string; // ISO date
  completedAt?: string;
  createdAt: string;
  output?: string; // Result or file path
  dependencies?: string[]; // Task IDs this depends on
  tags?: string[];
}

export interface TaskStore {
  tasks: Task[];
  lastUpdated: string;
  stats: {
    totalCompleted: number;
    totalFailed: number;
    streakDays: number;
  };
}

const TASKS_FILE = path.resolve(__dirname, '../data/tasks.json');

function ensureDataDir() {
  const dir = path.dirname(TASKS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function loadTasks(): TaskStore {
  ensureDataDir();
  if (fs.existsSync(TASKS_FILE)) {
    return JSON.parse(fs.readFileSync(TASKS_FILE, 'utf-8'));
  }
  return { tasks: [], lastUpdated: dayjs().toISOString(), stats: { totalCompleted: 0, totalFailed: 0, streakDays: 0 } };
}

export function saveTasks(store: TaskStore) {
  ensureDataDir();
  store.lastUpdated = dayjs().toISOString();
  fs.writeFileSync(TASKS_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

export function addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>): Task {
  const store = loadTasks();
  const newTask: Task = {
    ...task,
    id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    status: task.scheduledAt ? 'scheduled' : 'pending',
    createdAt: dayjs().toISOString(),
  };
  store.tasks.push(newTask);
  saveTasks(store);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const store = loadTasks();
  const idx = store.tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;
  
  store.tasks[idx] = { ...store.tasks[idx], ...updates };
  if (updates.status === 'completed') {
    store.tasks[idx].completedAt = dayjs().toISOString();
    store.stats.totalCompleted++;
  }
  if (updates.status === 'failed') {
    store.stats.totalFailed++;
  }
  saveTasks(store);
  return store.tasks[idx];
}

export function getNextTask(): Task | null {
  const store = loadTasks();
  const now = dayjs();
  
  // Find first: scheduled tasks that are due
  const due = store.tasks.find(t => 
    t.status === 'scheduled' && 
    t.scheduledAt && 
    dayjs(t.scheduledAt).isBefore(now)
  );
  if (due) return due;
  
  // Then: pending tasks by priority
  const priorityOrder: TaskPriority[] = ['critical', 'high', 'medium', 'low'];
  for (const prio of priorityOrder) {
    const task = store.tasks.find(t => t.status === 'pending' && t.priority === prio);
    if (task) return task;
  }
  
  return null;
}

export function getPendingTasks(): Task[] {
  const store = loadTasks();
  return store.tasks.filter(t => t.status === 'pending' || t.status === 'scheduled');
}

export function getTasksByCategory(category: TaskCategory): Task[] {
  const store = loadTasks();
  return store.tasks.filter(t => t.category === category);
}

export function printTaskBoard() {
  const store = loadTasks();
  const pending = store.tasks.filter(t => t.status === 'pending');
  const scheduled = store.tasks.filter(t => t.status === 'scheduled');
  const inProgress = store.tasks.filter(t => t.status === 'in-progress');
  const completed = store.tasks.filter(t => t.status === 'completed');

  console.log('\n📋 HireFlow Task Board');
  console.log('═'.repeat(60));
  
  if (scheduled.length > 0) {
    console.log(`\n📅 Scheduled (${scheduled.length})`);
    scheduled.forEach(t => console.log(`  ⏰ [${t.priority}] ${t.title} — ${t.scheduledAt}`));
  }
  
  if (inProgress.length > 0) {
    console.log(`\n🔄 In Progress (${inProgress.length})`);
    inProgress.forEach(t => console.log(`  ▶️  [${t.priority}] ${t.title}`));
  }
  
  if (pending.length > 0) {
    console.log(`\n📌 Pending (${pending.length})`);
    pending.forEach(t => console.log(`  ○  [${t.priority}] ${t.title}`));
  }
  
  if (completed.length > 0) {
    console.log(`\n✅ Completed (${completed.length})`);
    completed.slice(-5).forEach(t => console.log(`  ✓  ${t.title} — ${t.completedAt}`));
    if (completed.length > 5) console.log(`  ... and ${completed.length - 5} more`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log(`📊 Stats: ${store.stats.totalCompleted} completed | ${store.stats.totalFailed} failed | Streak: ${store.stats.streakDays} days`);
  console.log();
}

/** Seed initial tasks for the $100M plan */
export function seedInitialTasks() {
  const store = loadTasks();
  if (store.tasks.length > 0) {
    console.log('Tasks already seeded. Skipping.');
    return;
  }

  const tasks: Array<Omit<Task, 'id' | 'createdAt' | 'status'>> = [
    // Content tasks
    {
      title: '生成今日社交媒体内容',
      description: '使用publish.ts生成Twitter和LinkedIn的每日营销内容',
      category: 'content',
      priority: 'high',
      tags: ['daily', 'content'],
    },
    {
      title: '创建HireFlow产品介绍视频脚本',
      description: '编写30秒产品介绍视频的中文脚本，用于小红书和抖音',
      category: 'content',
      priority: 'high',
      tags: ['video', 'content'],
    },
    {
      title: '撰写AI招聘行业分析长文',
      description: '写一篇2000字的行业分析文，发布到微信公众号',
      category: 'content',
      priority: 'medium',
      tags: ['article', 'wechat'],
    },
    // Social media tasks
    {
      title: '发布Twitter产品公告',
      description: '将生成的Twitter内容发布到X/Twitter上',
      category: 'social',
      priority: 'critical',
      tags: ['twitter', 'launch'],
    },
    {
      title: '发布小红书产品笔记',
      description: '编写并发布小红书图文笔记，介绍HireFlow功能',
      category: 'social',
      priority: 'critical',
      tags: ['xiaohongshu', 'launch'],
    },
    {
      title: '发布LinkedIn专业文章',
      description: '发布LinkedIn文章，关于AI如何改变招聘行业',
      category: 'social',
      priority: 'high',
      tags: ['linkedin', 'thought-leadership'],
    },
    // Product tasks
    {
      title: 'EAS iOS构建',
      description: '完成EAS iOS构建并测试。需要交互式终端进行证书设置。',
      category: 'product',
      priority: 'critical',
      tags: ['ios', 'build'],
    },
    {
      title: 'App Store提交准备',
      description: '准备App Store截图、描述文案、关键字',
      category: 'product',
      priority: 'high',
      tags: ['appstore', 'submission'],
    },
    // Marketing tasks
    {
      title: 'ProductHunt提交',
      description: '准备ProductHunt产品页面，选择最佳发布时间',
      category: 'marketing',
      priority: 'medium',
      tags: ['producthunt', 'launch'],
    },
    {
      title: '设置Google Analytics',
      description: '在landing page上添加Google Analytics追踪代码',
      category: 'analytics',
      priority: 'medium',
      tags: ['analytics', 'tracking'],
    },
    // Dev tasks
    {
      title: '开发付费课程落地页',
      description: '创建AI招聘课程的购买页面，接入Stripe支付',
      category: 'dev',
      priority: 'medium',
      tags: ['course', 'revenue'],
    },
    {
      title: '添加App内购推送',
      description: '实现每7天一次的升级提醒推送通知',
      category: 'dev',
      priority: 'low',
      tags: ['notification', 'conversion'],
    },
  ];

  tasks.forEach(t => addTask(t));
  console.log(`✅ Seeded ${tasks.length} initial tasks`);
}
