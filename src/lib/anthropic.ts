// ─── AI Provider: OpenRouter (primary) → Groq → Gemini → Demo ───
// OpenRouter gives access to many models via single API.
// Memory system saves/retrieves from AgentMemory table.

import prisma from './prisma';

// ─── Configuration ────────────────────────────────────────
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.Gemini_API_Key || '';
const GROQ_KEY = process.env.GROQ_API_KEY || process.env.Groq_API_key || '';

const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 4096;
const MEMORY_LIMIT = 10; // max memories injected per request

// Log which providers are available at startup
console.log(`[AI] Providers: OpenRouter=${OPENROUTER_KEY ? 'YES' : 'NO'}, Groq=${GROQ_KEY ? 'YES' : 'NO'}, Gemini=${GEMINI_KEY ? 'YES' : 'NO'}`);

// ─── Provider Types ───────────────────────────────────────
export type AIProvider = 'openrouter' | 'gemini' | 'groq' | 'demo';

export interface AIRequest {
  systemPrompt: string;
  skillInstruction: string;
  userBriefing: string;
  agentName: string;
  provider?: AIProvider;
  model?: string;
  // Memory context
  tenantId?: string;
  agentId?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  isDemo: boolean;
  tokensUsed?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ─── Resolve Provider ─────────────────────────────────────
function resolveProvider(requested?: AIProvider): AIProvider {
  if (requested === 'openrouter' && OPENROUTER_KEY) return 'openrouter';
  if (requested === 'gemini' && GEMINI_KEY) return 'gemini';
  if (requested === 'groq' && GROQ_KEY) return 'groq';

  // Auto-detect best available
  if (OPENROUTER_KEY) return 'openrouter';
  if (GROQ_KEY) return 'groq';
  if (GEMINI_KEY) return 'gemini';

  return 'demo';
}

const DEMO_MODE = !OPENROUTER_KEY && !GEMINI_KEY && !GROQ_KEY;

// ─── Memory System ────────────────────────────────────────
async function getMemories(tenantId: string, agentId: string): Promise<string> {
  try {
    const memories = await prisma.agentMemory.findMany({
      where: { tenantId, agentId },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
      take: MEMORY_LIMIT,
      select: { type: true, content: true, importance: true },
    });

    if (memories.length === 0) return '';

    const memoryText = memories
      .map(m => `[${m.type}] ${m.content}`)
      .join('\n');

    return `\n\n--- ذاكرتك السابقة مع هذا العميل ---\n${memoryText}\n--- انتهت الذاكرة ---\n\nاستخدم هذه المعلومات لتقديم خدمة شخصية أفضل. لا تذكر أن لديك "ذاكرة" صراحة.`;
  } catch {
    return '';
  }
}

export async function saveMemory(
  tenantId: string,
  agentId: string,
  type: string,
  content: string,
  importance: number = 5,
  source?: string,
): Promise<void> {
  try {
    await prisma.agentMemory.create({
      data: { tenantId, agentId, type, content, importance, source },
    });
  } catch (err) {
    console.error('Failed to save memory:', err);
  }
}

// Auto-extract key facts from a conversation to save as memory
export function extractMemoryFacts(userMessage: string, agentReply: string): string | null {
  // Save if message contains business info, preferences, or feedback
  const triggers = [
    'شركت', 'منتج', 'خدمة', 'عميل', 'علامة', 'ميزانية', 'هدف',
    'جمهور', 'منافس', 'موقع', 'سوق', 'مبيعات', 'company', 'product',
    'brand', 'budget', 'target', 'audience', 'website',
  ];

  const hasTrigger = triggers.some(t =>
    userMessage.toLowerCase().includes(t)
  );

  if (hasTrigger && userMessage.length > 20) {
    // Summarize the exchange
    const summary = userMessage.length > 200
      ? userMessage.substring(0, 200) + '...'
      : userMessage;
    return `طلب العميل: ${summary}`;
  }

  return null;
}

// ─── Gemini (Google) ──────────────────────────────────────
async function callGemini(
  messages: { role: string; parts: { text: string }[] }[],
  systemInstruction: string,
  model?: string,
): Promise<AIResponse> {
  const m = model || GEMINI_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_KEY}`;

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: messages,
    generationConfig: {
      maxOutputTokens: MAX_TOKENS,
      temperature: 0.8,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata
    ? (data.usageMetadata.promptTokenCount || 0) + (data.usageMetadata.candidatesTokenCount || 0)
    : undefined;

  return {
    content,
    model: m,
    provider: 'gemini',
    isDemo: false,
    tokensUsed,
  };
}

// ─── Groq (Llama 3.3) ────────────────────────────────────
async function callGroq(
  messages: { role: string; content: string }[],
  model?: string,
): Promise<AIResponse> {
  const m = model || GROQ_MODEL;
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: m,
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage
    ? data.usage.prompt_tokens + data.usage.completion_tokens
    : undefined;

  return {
    content,
    model: m,
    provider: 'groq',
    isDemo: false,
    tokensUsed,
  };
}

// ─── OpenRouter (Multi-model) ────────────────────────────
async function callOpenRouter(
  messages: { role: string; content: string }[],
  model?: string,
): Promise<AIResponse> {
  const m = model || OPENROUTER_MODEL;
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://collab-platform-iota.vercel.app',
      'X-Title': 'Collab Platform',
    },
    body: JSON.stringify({
      model: m,
      max_tokens: MAX_TOKENS,
      temperature: 0.8,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  const tokensUsed = data.usage
    ? (data.usage.prompt_tokens || 0) + (data.usage.completion_tokens || 0)
    : undefined;

  return {
    content,
    model: m,
    provider: 'openrouter',
    isDemo: false,
    tokensUsed,
  };
}

// ─── Main Task API Call ───────────────────────────────────
export async function callAI(request: AIRequest): Promise<AIResponse> {
  // Inject memories into system prompt
  let systemPrompt = request.systemPrompt;
  if (request.tenantId && request.agentId) {
    const memories = await getMemories(request.tenantId, request.agentId);
    systemPrompt += memories;
  }

  const userContent = `${request.skillInstruction}\n\n---\n\nطلب العميل:\n${request.userBriefing}`;

  // Try Gemini first
  if (GEMINI_KEY) {
    try {
      const result = await callGemini(
        [{ role: 'user', parts: [{ text: userContent }] }],
        systemPrompt,
        request.model,
      );

      // Save memory after successful task
      if (request.tenantId && request.agentId) {
        await saveMemory(
          request.tenantId, request.agentId,
          'task_summary',
          `نفذ مهمة: ${request.userBriefing.substring(0, 150)}`,
          6,
        );
      }

      return result;
    } catch (err) {
      console.error('Gemini Error:', err);
    }
  }

  // Fallback to Groq
  if (GROQ_KEY) {
    try {
      const result = await callGroq([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ], request.model);

      if (request.tenantId && request.agentId) {
        await saveMemory(
          request.tenantId, request.agentId,
          'task_summary',
          `نفذ مهمة: ${request.userBriefing.substring(0, 150)}`,
          6,
        );
      }

      return result;
    } catch (err) {
      console.error('Groq Error:', err);
    }
  }

  // Last resort: demo
  return generateDemoResponse(request);
}

// ─── Chat API Call (with memory) ──────────────────────────
export async function callAIChat(
  messages: ChatMessage[],
  systemPrompt: string,
  provider?: AIProvider,
  model?: string,
  tenantId?: string,
  agentId?: string,
): Promise<AIResponse> {
  // Inject memories into system prompt
  let enrichedPrompt = systemPrompt;
  if (tenantId && agentId) {
    const memories = await getMemories(tenantId, agentId);
    enrichedPrompt += memories;
  }

  const resolved = resolveProvider(provider);

  console.log(`[AIChat] Resolved: ${resolved}, OpenRouter=${OPENROUTER_KEY ? 'set' : 'no'}, Groq=${GROQ_KEY ? 'set' : 'no'}, Gemini=${GEMINI_KEY ? 'set' : 'no'}`);

  // Helper to save memory after successful response
  const saveConversationMemory = async (result: AIResponse) => {
    if (tenantId && agentId && messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        const fact = extractMemoryFacts(lastUserMsg.content, result.content);
        if (fact) {
          await saveMemory(tenantId, agentId, 'learned_fact', fact, 5);
        }
      }
    }
  };

  // 1. Try OpenRouter FIRST (most reliable)
  if (OPENROUTER_KEY) {
    try {
      const orMsgs = [
        { role: 'system', content: enrichedPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];
      const result = await callOpenRouter(orMsgs, model);
      await saveConversationMemory(result);
      return result;
    } catch (err) {
      console.error('OpenRouter Chat Error:', err);
    }
  }

  // 2. Fallback to Groq
  if (GROQ_KEY) {
    try {
      const groqMsgs = [
        { role: 'system', content: enrichedPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];
      const result = await callGroq(groqMsgs, model);
      await saveConversationMemory(result);
      return result;
    } catch (err) {
      console.error('Groq Chat Error:', err);
    }
  }

  // 3. Fallback to Gemini
  if (GEMINI_KEY) {
    try {
      const geminiMsgs = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      const result = await callGemini(geminiMsgs, enrichedPrompt, model);
      await saveConversationMemory(result);
      return result;
    } catch (err) {
      console.error('Gemini Chat Error:', err);
    }
  }

  // Demo fallback
  console.error('[AIChat] ALL PROVIDERS FAILED — returning demo response');
  return {
    content: '⚠️ عذراً، كل مزودي الذكاء الاصطناعي غير متاحين حالياً. تواصل مع الدعم.',
    model: 'demo-fallback',
    provider: 'demo',
    isDemo: true,
  };
}

// ─── Demo Mode ────────────────────────────────────────────
function generateDemoResponse(request: AIRequest): AIResponse {
  return {
    content: `# تقرير ${request.agentName}\n\n## ملخص المهمة\nتم تنفيذ المهمة بنجاح.\n\n### التوصيات\n1. مراجعة المحتوى مع فريقك\n2. تخصيص التفاصيل لعلامتك التجارية\n3. اختبار نسخ مختلفة\n\n> **ملاحظة**: هذا تقرير تجريبي. للحصول على محتوى حقيقي، تأكد من إعداد مفاتيح AI.\n\n---\n*${request.agentName}*`,
    model: 'demo-mode',
    provider: 'demo',
    isDemo: true,
  };
}

export { DEMO_MODE };
