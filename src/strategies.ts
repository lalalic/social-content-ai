// Social Content AI — Topic & strategy templates
// Pre-built content strategies for HireFlow marketing

export interface ContentStrategy {
  name: string;
  description: string;
  topics: string[];
  platforms: string[];
  frequency: string;
  targetAudience: string;
}

// HireFlow-specific marketing strategies
export const STRATEGIES: Record<string, ContentStrategy> = {
  hireflow_launch: {
    name: 'HireFlow产品发布',
    description: '围绕HireFlow AI招聘助手的产品发布进行社交媒体推广',
    topics: [
      'AI招聘的未来：为什么传统招聘方式已经过时',
      '我如何用AI在10分钟内评估100个候选人',
      '跨境招聘的痛点：语言障碍、时区差异、文化差异',
      'HireFlow：一款真正保护隐私的AI招聘工具（数据本地存储）',
      '招聘效率提升10倍：AI评分+智能外联的威力',
      '为什么我把招聘数据存在本地而不是云端',
      '从0到1开发AI招聘App的经历和感悟',
      '免费vs付费：HireFlow的功能对比',
      '给HR的AI工具推荐：2024年必备清单',
      '如何用AI写出完美的招聘外联消息',
    ],
    platforms: ['twitter', 'linkedin', 'xiaohongshu', 'wechat'],
    frequency: '每天1-2篇',
    targetAudience: 'HR、招聘经理、猎头、创业者',
  },

  ai_recruiting_education: {
    name: 'AI招聘知识分享',
    description: '教育内容，建立行业专家形象',
    topics: [
      'AI面试评分系统是如何工作的',
      '5个AI招聘工具的深度对比',
      '如何评估候选人的文化匹配度',
      '远程面试的10个最佳实践',
      '用AI分析简历：技术背后的原理',
      '招聘漏斗优化：从发现到入职',
      '多语言招聘消息的撰写技巧',
      '如何建立高效的人才数据库',
      'LinkedIn vs 脉脉：跨境招聘平台对比',
      '招聘数据分析：你应该关注哪些指标',
    ],
    platforms: ['linkedin', 'wechat', 'xiaohongshu'],
    frequency: '每周3-4篇',
    targetAudience: 'HR从业者、招聘团队、人力资源专业学生',
  },

  tech_building: {
    name: '技术创业分享',
    description: '分享独立开发者的技术创业经历',
    topics: [
      '我如何用React Native开发跨平台应用',
      'AI API选择指南：OpenAI vs 通义千问 vs DeepSeek',
      '独立开发者的一天：从想法到产品',
      '为什么我选择SQLite而不是云数据库',
      'Expo vs 原生开发：我的选择和理由',
      'Stripe集成实战：移动端支付的坑',
      '从$0到$100：我的第一笔SaaS收入',
      'TypeScript全栈开发的最佳实践',
      '如何用AI辅助编程提高10倍效率',
      '移动端App上架流程全攻略',
    ],
    platforms: ['twitter', 'xiaohongshu', 'wechat'],
    frequency: '每周2-3篇',
    targetAudience: '独立开发者、技术创业者、程序员',
  },

  video_content: {
    name: '视频内容策划',
    description: '短视频和教程视频脚本',
    topics: [
      '30秒演示：AI如何秒评候选人\n[展示HireFlow评分功能]',
      '1分钟教程：导入LinkedIn联系人到HireFlow\n[屏幕录制]',
      'AI写的招聘消息 vs 人写的，你能分辨吗？\n[互动视频]',
      '招聘效率对比：手动 vs AI辅助\n[数据可视化]',
      '开发者日记：今天修了一个Bug\n[Vlog风格]',
      'AI生成面试问题：好用还是不好用？\n[实测体验]',
    ],
    platforms: ['douyin', 'xiaohongshu'],
    frequency: '每周1-2个视频',
    targetAudience: '泛职场人群、科技爱好者',
  },
};

// Content calendar template
export function generateContentCalendar(weeks: number = 4): Array<{
  date: string;
  platform: string;
  topic: string;
  type: string;
  strategy: string;
}> {
  const calendar: Array<{ date: string; platform: string; topic: string; type: string; strategy: string }> = [];
  const today = new Date();

  const strategies = Object.values(STRATEGIES);
  
  for (let week = 0; week < weeks; week++) {
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + week * 7 + day);
      const dateStr = date.toISOString().split('T')[0];

      // Rotate strategies
      const strategy = strategies[day % strategies.length];
      const topic = strategy.topics[week % strategy.topics.length];
      const platform = strategy.platforms[day % strategy.platforms.length];

      calendar.push({
        date: dateStr,
        platform,
        topic,
        type: day === 5 || day === 6 ? 'video_script' : 'post',
        strategy: strategy.name,
      });
    }
  }

  return calendar;
}

// Hashtag library
export const HASHTAG_SETS: Record<string, string[]> = {
  recruiting: ['#AI招聘', '#人才管理', '#招聘效率', '#HR科技', '#AiRecruiting', '#HRTech', '#TalentManagement'],
  tech: ['#独立开发', '#ReactNative', '#AI', '#SaaS', '#IndieHacker', '#BuildInPublic', '#技术创业'],
  startup: ['#创业', '#副业', '#被动收入', '#SideProject', '#Startup', '#Solopreneur'],
  hireflow: ['#HireFlow', '#AI简历筛选', '#智能招聘', '#跨境招聘'],
};
