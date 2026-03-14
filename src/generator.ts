// Social Content AI — Content generation engine
// Generates posts for Twitter/X, LinkedIn, WeChat, Xiaohongshu, Douyin
import OpenAI from 'openai';

export type Platform = 'twitter' | 'linkedin' | 'wechat' | 'xiaohongshu' | 'douyin';
export type ContentType = 'post' | 'thread' | 'video_script' | 'story' | 'tutorial';
export type Language = 'zh' | 'en' | 'both';

export interface ContentRequest {
  platform: Platform;
  type: ContentType;
  topic: string;
  language: Language;
  productName?: string;    // e.g. "HireFlow"
  productUrl?: string;
  tone?: 'professional' | 'casual' | 'humorous' | 'educational';
  hashtags?: boolean;
  includeEmoji?: boolean;
  maxLength?: number;
}

export interface GeneratedContent {
  platform: Platform;
  type: ContentType;
  language: Language;
  content: string;
  hashtags: string[];
  scheduledFor?: string;    // ISO date string
  metadata: {
    topic: string;
    generatedAt: string;
    model: string;
    wordCount: number;
  };
}

const PLATFORM_CONFIGS: Record<Platform, { maxChars: number; name: string; zhName: string }> = {
  twitter: { maxChars: 280, name: 'Twitter/X', zhName: '推特/X' },
  linkedin: { maxChars: 3000, name: 'LinkedIn', zhName: '领英' },
  wechat: { maxChars: 5000, name: 'WeChat Article', zhName: '微信公众号' },
  xiaohongshu: { maxChars: 1000, name: 'Xiaohongshu', zhName: '小红书' },
  douyin: { maxChars: 500, name: 'Douyin/TikTok', zhName: '抖音' },
};

const CONTENT_TYPE_PROMPTS: Record<ContentType, string> = {
  post: 'a social media post',
  thread: 'a thread (5-8 connected posts)',
  video_script: 'a short video script (30-60 seconds)',
  story: 'a compelling story/case study',
  tutorial: 'a step-by-step tutorial or tip',
};

export class ContentGenerator {
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model = 'gpt-4o-mini') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  async generate(request: ContentRequest): Promise<GeneratedContent> {
    const platform = PLATFORM_CONFIGS[request.platform];
    const maxLen = request.maxLength || platform.maxChars;
    const langInstruction = request.language === 'zh' 
      ? '用中文写。' 
      : request.language === 'both' 
        ? '先写中文版本，然后写英文版本，用 --- 分隔。'
        : 'Write in English.';

    const toneMap = {
      professional: '专业、权威的语气',
      casual: '轻松、随意的语气',
      humorous: '幽默、有趣的语气',
      educational: '教育性、知识分享的语气',
    };

    const systemPrompt = `You are an expert social media content creator specializing in tech, AI, and recruitment industry. 
You create viral, engaging content that drives followers and conversions.
You know how to write for ${platform.name} (${platform.zhName}).
Content must be under ${maxLen} characters.
${request.tone ? `Tone: ${toneMap[request.tone]}` : ''}
${request.includeEmoji !== false ? 'Use relevant emojis.' : 'No emojis.'}
${request.hashtags !== false ? 'Include 3-5 relevant hashtags.' : 'No hashtags.'}
${request.productName ? `Subtly promote ${request.productName}${request.productUrl ? ` (${request.productUrl})` : ''} when relevant, but don't be too salesy.` : ''}
${langInstruction}`;

    const userPrompt = `Create ${CONTENT_TYPE_PROMPTS[request.type]} for ${platform.name} about: ${request.topic}`;

    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    // Extract hashtags
    const hashtagRegex = /#[\w\u4e00-\u9fff]+/g;
    const hashtags = content.match(hashtagRegex) || [];

    return {
      platform: request.platform,
      type: request.type,
      language: request.language,
      content,
      hashtags,
      metadata: {
        topic: request.topic,
        generatedAt: new Date().toISOString(),
        model: this.model,
        wordCount: content.length,
      },
    };
  }

  async generateBatch(topics: string[], platforms: Platform[], language: Language = 'zh'): Promise<GeneratedContent[]> {
    const results: GeneratedContent[] = [];
    
    for (const topic of topics) {
      for (const platform of platforms) {
        const content = await this.generate({
          platform,
          type: 'post',
          topic,
          language,
          productName: 'HireFlow',
          productUrl: 'https://github.com/lalalic/hireflow',
          tone: 'educational',
          hashtags: true,
          includeEmoji: true,
        });
        results.push(content);
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
      }
    }

    return results;
  }

  async generateWeeklyPlan(niche: string, language: Language = 'zh'): Promise<GeneratedContent[]> {
    // Generate a week's worth of content across platforms
    const weeklyTopics = [
      `${niche}行业趋势和洞察`,
      `AI如何改变${niche}`,
      `${niche}入门教程和技巧`,
      `成功案例：${niche}的真实故事`,
      `常见误区：${niche}中的错误做法`,
      `工具推荐：提高${niche}效率的工具`,
      `未来展望：${niche}的下一步`,
    ];

    const platformRotation: Platform[] = [
      'twitter', 'linkedin', 'xiaohongshu', 'twitter', 'wechat', 'twitter', 'linkedin',
    ];

    const results: GeneratedContent[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + i);
      
      const content = await this.generate({
        platform: platformRotation[i],
        type: i === 4 ? 'story' : i === 2 ? 'tutorial' : 'post',
        topic: weeklyTopics[i],
        language,
        productName: 'HireFlow',
        tone: i % 2 === 0 ? 'educational' : 'casual',
        hashtags: true,
        includeEmoji: true,
      });

      content.scheduledFor = scheduledDate.toISOString().split('T')[0];
      results.push(content);
      
      await new Promise(r => setTimeout(r, 500));
    }

    return results;
  }
}
