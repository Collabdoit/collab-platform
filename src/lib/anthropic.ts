import Anthropic from '@anthropic-ai/sdk';

// ─── Configuration ────────────────────────────────────────
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;

// ─── Client Setup ─────────────────────────────────────────
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    if (DEMO_MODE) {
      throw new Error('Anthropic API key not configured. Running in demo mode.');
    }
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// ─── Types ────────────────────────────────────────────────
export interface AIRequest {
  systemPrompt: string;
  skillInstruction: string;
  userBriefing: string;
  agentName: string;
}

export interface AIResponse {
  content: string;
  model: string;
  isDemo: boolean;
  tokensUsed?: number;
}

// ─── Main API Call ────────────────────────────────────────
export async function callAI(request: AIRequest): Promise<AIResponse> {
  if (DEMO_MODE) {
    return generateDemoResponse(request);
  }

  try {
    const anthropic = getClient();
    
    const message = await anthropic.messages.create({
      model: MODEL,
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
      model: MODEL,
      isDemo: false,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    };
  } catch (error) {
    console.error('Anthropic API Error:', error);
    // Fallback to demo mode on error
    return generateDemoResponse(request);
  }
}

// ─── Demo Mode (Mock Responses) ───────────────────────────
function generateDemoResponse(request: AIRequest): AIResponse {
  const demoResponses: Record<string, string> = {
    'تقويم المحتوى': `# 📅 تقويم المحتوى الشهري

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

### 📝 ملاحظات
- ركز على المحتوى المرئي في إنستغرام وتيك توك
- استخدم الهاشتاقات السعودية الشائعة
- أفضل أوقات النشر للجمهور السعودي: 8-10 مساءً

### #️⃣ هاشتاقات مقترحة
\`#تسويق_رقمي\` \`#السعودية\` \`#اعمال\` \`#تجارة_الكترونية\` \`#رواد_اعمال\`

---
*تم إعداد هذا التقويم بواسطة نورة — أخصائية استراتيجية المحتوى* ✨`,

    'default': `# 📋 تقرير ${request.agentName}

## ملخص المهمة
تم تنفيذ المهمة بنجاح بناءً على الطلب المقدم.

## التفاصيل

### النقاط الرئيسية
- ✅ تم تحليل المتطلبات المقدمة
- ✅ تم إعداد المحتوى وفقاً لأفضل الممارسات
- ✅ تم مراعاة خصوصية السوق السعودي

### التوصيات
1. **مراجعة المحتوى** — يُنصح بمراجعة المحتوى مع فريقك قبل النشر
2. **التخصيص** — قم بتعديل التفاصيل لتناسب علامتك التجارية
3. **الاختبار** — جرّب نسخ مختلفة واقيس النتائج

### الخطوات التالية
- [ ] مراجعة المحتوى مع الفريق
- [ ] تعديل التفاصيل حسب الحاجة
- [ ] جدولة النشر
- [ ] متابعة النتائج

---

> 💡 **ملاحظة**: هذا تقرير تجريبي (Demo Mode). للحصول على محتوى مخصص بالكامل، يرجى تفعيل مفتاح Anthropic API.

---
*تم إعداد هذا التقرير بواسطة ${request.agentName}* 🏢`,
  };

  // Try to match a specific skill instruction keyword
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
    isDemo: true,
  };
}

export { DEMO_MODE };
