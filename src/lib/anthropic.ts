import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// ─── Configuration ────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const DEMO_MODE = !ANTHROPIC_KEY && !OPENAI_KEY;

// Model defaults
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
const GPT_MODEL = process.env.GPT_MODEL || 'gpt-4o';
const MAX_TOKENS = 4096;

// ─── Provider Types ───────────────────────────────────────
export type AIProvider = 'claude' | 'gpt';

export interface AIRequest {
  systemPrompt: string;
  skillInstruction: string;
  userBriefing: string;
  agentName: string;
  provider?: AIProvider;   // Which model to use (defaults based on availability)
  model?: string;          // Override specific model name
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider | 'demo';
  isDemo: boolean;
  tokensUsed?: number;
}

// ─── Client Singletons ───────────────────────────────────
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    anthropicClient = new Anthropic({ apiKey: ANTHROPIC_KEY });
  }
  return anthropicClient;
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY not set');
    openaiClient = new OpenAI({ apiKey: OPENAI_KEY });
  }
  return openaiClient;
}

// ─── Resolve Provider ─────────────────────────────────────
function resolveProvider(requested?: AIProvider): AIProvider | 'demo' {
  if (DEMO_MODE) return 'demo';

  if (requested === 'claude' && ANTHROPIC_KEY) return 'claude';
  if (requested === 'gpt' && OPENAI_KEY) return 'gpt';

  // If specific provider requested but key missing, fall back
  if (requested === 'claude' && !ANTHROPIC_KEY && OPENAI_KEY) return 'gpt';
  if (requested === 'gpt' && !OPENAI_KEY && ANTHROPIC_KEY) return 'claude';

  // No preference — use whichever is available (prefer Claude)
  if (ANTHROPIC_KEY) return 'claude';
  if (OPENAI_KEY) return 'gpt';

  return 'demo';
}

// ─── Main API Call ────────────────────────────────────────
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const provider = resolveProvider(request.provider);

  if (provider === 'demo') {
    return generateDemoResponse(request);
  }

  try {
    if (provider === 'claude') {
      return await callClaude(request);
    } else {
      return await callGPT(request);
    }
  } catch (error) {
    console.error(`${provider} API Error:`, error);

    // Try the other provider as fallback
    try {
      if (provider === 'claude' && OPENAI_KEY) {
        console.log('Falling back to GPT...');
        return await callGPT(request);
      }
      if (provider === 'gpt' && ANTHROPIC_KEY) {
        console.log('Falling back to Claude...');
        return await callClaude(request);
      }
    } catch (fallbackError) {
      console.error('Fallback provider also failed:', fallbackError);
    }

    // Last resort: demo mode
    return generateDemoResponse(request);
  }
}

// ─── Claude (Anthropic) ──────────────────────────────────
async function callClaude(request: AIRequest): Promise<AIResponse> {
  const client = getAnthropicClient();
  const model = request.model || CLAUDE_MODEL;

  const message = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    system: request.systemPrompt,
    messages: [
      {
        role: 'user',
        content: `${request.skillInstruction}\n\n---\n\nطلب العميل:\n${request.userBriefing}`,
      },
    ],
  });

  const textContent = message.content.find((c) => c.type === 'text');

  return {
    content: textContent?.text || 'لم يتم توليد محتوى.',
    model,
    provider: 'claude',
    isDemo: false,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
  };
}

// ─── GPT (OpenAI) ─────────────────────────────────────────
async function callGPT(request: AIRequest): Promise<AIResponse> {
  const client = getOpenAIClient();
  const model = request.model || GPT_MODEL;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: 'system',
        content: request.systemPrompt,
      },
      {
        role: 'user',
        content: `${request.skillInstruction}\n\n---\n\nطلب العميل:\n${request.userBriefing}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content || 'لم يتم توليد محتوى.';
  const tokensUsed = completion.usage
    ? completion.usage.prompt_tokens + completion.usage.completion_tokens
    : undefined;

  return {
    content,
    model,
    provider: 'gpt',
    isDemo: false,
    tokensUsed,
  };
}

// ─── Chat Mode (for Interview & Workspace) ────────────────
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function callAIChat(
  messages: ChatMessage[],
  systemPrompt: string,
  provider?: AIProvider,
  model?: string,
): Promise<AIResponse> {
  const resolved = resolveProvider(provider);

  if (resolved === 'demo') {
    return {
      content: 'شكراً على سؤالك! أنا متحمس/ة للعمل معك. كيف أقدر أساعدك؟',
      model: 'demo-mode',
      provider: 'demo',
      isDemo: true,
    };
  }

  try {
    if (resolved === 'claude') {
      return await callClaudeChat(messages, systemPrompt, model);
    } else {
      return await callGPTChat(messages, systemPrompt, model);
    }
  } catch (error) {
    console.error(`${resolved} Chat Error:`, error);
    return {
      content: 'عذراً، حدث خطأ تقني. يمكنك المحاولة مرة أخرى.',
      model: 'error-fallback',
      provider: resolved,
      isDemo: false,
    };
  }
}

async function callClaudeChat(
  messages: ChatMessage[],
  systemPrompt: string,
  model?: string,
): Promise<AIResponse> {
  const client = getAnthropicClient();
  const m = model || CLAUDE_MODEL;

  // Convert to Anthropic format (no system role in messages)
  const anthropicMessages = messages
    .filter((msg) => msg.role !== 'system')
    .map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

  const response = await client.messages.create({
    model: m,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: anthropicMessages,
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return {
    content: textContent?.text || '',
    model: m,
    provider: 'claude',
    isDemo: false,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}

async function callGPTChat(
  messages: ChatMessage[],
  systemPrompt: string,
  model?: string,
): Promise<AIResponse> {
  const client = getOpenAIClient();
  const m = model || GPT_MODEL;

  const openaiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    })),
  ];

  const completion = await client.chat.completions.create({
    model: m,
    max_tokens: MAX_TOKENS,
    messages: openaiMessages,
  });

  const content = completion.choices[0]?.message?.content || '';
  const tokensUsed = completion.usage
    ? completion.usage.prompt_tokens + completion.usage.completion_tokens
    : undefined;

  return {
    content,
    model: m,
    provider: 'gpt',
    isDemo: false,
    tokensUsed,
  };
}

// ─── Demo Mode (Mock Responses) ───────────────────────────
function generateDemoResponse(request: AIRequest): AIResponse {
  const demoResponses: Record<string, string> = {
    'تقويم المحتوى': `# تقويم المحتوى الشهري

## الأسبوع الأول — بناء الوعي

| اليوم | المنصة | نوع المحتوى | الموضوع | الوقت |
|-------|--------|-------------|---------|-------|
| الأحد | إنستغرام | ريلز | تعريف بالعلامة التجارية | 8:00 م |
| الإثنين | تويتر | ثريد | نصائح في المجال | 10:00 ص |
| الثلاثاء | تيك توك | فيديو قصير | خلف الكواليس | 6:00 م |
| الأربعاء | إنستغرام | كاروسيل | إنفوجرافيك تعليمي | 12:00 م |
| الخميس | سناب شات | ستوري | يوم في حياة الفريق | 2:00 م |

## الأسبوع الثاني — التفاعل

| اليوم | المنصة | نوع المحتوى | الموضوع | الوقت |
|-------|--------|-------------|---------|-------|
| الأحد | تويتر | استطلاع | سؤال تفاعلي | 9:00 ص |
| الإثنين | إنستغرام | ريلز | شهادة عميل | 7:00 م |
| الثلاثاء | تيك توك | ترند | مشاركة ترند مع لمسة | 5:00 م |
| الأربعاء | إنستغرام | بوست | اقتباس ملهم | 11:00 ص |
| الخميس | تويتر | مسابقة | مسابقة أسبوعية | 3:00 م |

### ملاحظات
- ركز على المحتوى المرئي في إنستغرام وتيك توك
- استخدم الهاشتاقات السعودية الشائعة
- أفضل أوقات النشر للجمهور السعودي: 8-10 مساءً

---
*تم إعداد هذا التقويم بواسطة نورة — أخصائية استراتيجية المحتوى*`,

    'default': `# تقرير ${request.agentName}

## ملخص المهمة
تم تنفيذ المهمة بنجاح بناءً على الطلب المقدم.

## التفاصيل

### النقاط الرئيسية
- تم تحليل المتطلبات المقدمة
- تم إعداد المحتوى وفقاً لأفضل الممارسات
- تم مراعاة خصوصية السوق السعودي

### التوصيات
1. **مراجعة المحتوى** — يُنصح بمراجعة المحتوى مع فريقك قبل النشر
2. **التخصيص** — قم بتعديل التفاصيل لتناسب علامتك التجارية
3. **الاختبار** — جرّب نسخ مختلفة واقيس النتائج

---

> **ملاحظة**: هذا تقرير تجريبي (Demo Mode). للحصول على محتوى مخصص، فعّل مفتاح API.

---
*تم إعداد هذا التقرير بواسطة ${request.agentName}*`,
  };

  let content = demoResponses['default'];
  for (const [key, value] of Object.entries(demoResponses)) {
    if (key !== 'default' && request.skillInstruction.includes(key)) {
      content = value;
      break;
    }
  }

  return {
    content,
    model: 'demo-mode',
    provider: 'demo',
    isDemo: true,
  };
}

export { DEMO_MODE };
