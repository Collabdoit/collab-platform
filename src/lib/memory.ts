import prisma from './prisma';
import { extractStructured } from './anthropic';

// ─── Types ────────────────────────────────────────────────

interface MemoryContext {
  enrichedPrompt: string;
  knowledgeCount: number;
  memoryCount: number;
}

// ─── Build Enriched Prompt (inject tenant data + memories) ─

export async function buildEnrichedPrompt(
  baseSystemPrompt: string,
  tenantId: string,
  agentId: string,
): Promise<MemoryContext> {
  // 1. Fetch tenant info
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      industry: true,
      brandGuideAr: true,
    },
  });

  // 2. Fetch tenant knowledge (top 10, active)
  const knowledge = await prisma.tenantKnowledge.findMany({
    where: { tenantId, isActive: true },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  });

  // 3. Fetch agent memories for this tenant (top 15 by importance)
  const memories = await prisma.agentMemory.findMany({
    where: { tenantId, agentId },
    orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    take: 15,
  });

  // 4. Compose enriched prompt
  let prompt = baseSystemPrompt;

  // Tenant brand context
  if (tenant) {
    prompt += '\n\n═══ سياق العميل ═══';
    prompt += `\nاسم الشركة: ${tenant.name}`;
    if (tenant.industry) prompt += `\nالمجال: ${tenant.industry}`;
    if (tenant.brandGuideAr) prompt += `\n\nدليل العلامة التجارية:\n${tenant.brandGuideAr}`;
  }

  // Tenant knowledge base
  if (knowledge.length > 0) {
    prompt += '\n\n═══ قاعدة المعرفة ═══';
    for (const k of knowledge) {
      prompt += `\n\n### ${k.title} [${k.category}]\n${k.content}`;
    }
  }

  // Agent's memories from past interactions
  if (memories.length > 0) {
    prompt += '\n\n═══ ذاكرتك من التعاملات السابقة ═══';
    prompt += '\nاستخدم هذه المعلومات لتقديم خدمة أفضل وأكثر تخصيصاً:';
    for (const m of memories) {
      const typeLabel = MEMORY_TYPE_LABELS[m.type] || m.type;
      prompt += `\n- [${typeLabel}] ${m.content}`;
    }
  }

  return {
    enrichedPrompt: prompt,
    knowledgeCount: knowledge.length,
    memoryCount: memories.length,
  };
}

const MEMORY_TYPE_LABELS: Record<string, string> = {
  task_summary: 'ملخص مهمة',
  user_preference: 'تفضيل العميل',
  learned_fact: 'معلومة مكتسبة',
  feedback: 'تقييم وملاحظات',
};

// ─── Extract and Store Memories After Task Completion ──────

export async function extractTaskMemory(
  tenantId: string,
  agentId: string,
  taskId: string,
  taskTitle: string,
  userBriefing: string,
  deliverableContent: string,
): Promise<void> {
  // 1. Store task summary
  const briefingSummary = userBriefing.length > 150
    ? userBriefing.substring(0, 150) + '...'
    : userBriefing;

  await prisma.agentMemory.create({
    data: {
      tenantId,
      agentId,
      type: 'task_summary',
      content: `نفّذت "${taskTitle}": ${briefingSummary}`,
      source: taskId,
      importance: 5,
    },
  });

  // 2. Extract durable, business-relevant learnings from the deliverable.
  //    Prefer an LLM pass; fall back to the heuristic if it returns nothing.
  let learnings = await extractLearningsLLM(taskTitle, userBriefing, deliverableContent);
  let importance = 6; // LLM-extracted facts are worth more
  if (learnings.length === 0) {
    learnings = extractKeyFacts(deliverableContent); // heuristic fallback
    importance = 4;
  }

  if (learnings.length > 0) {
    // Store each learning as its own memory so retrieval/pruning is granular.
    await prisma.agentMemory.createMany({
      data: learnings.slice(0, 5).map((fact) => ({
        tenantId,
        agentId,
        type: 'learned_fact',
        content: fact,
        source: taskId,
        importance,
      })),
    });
  }
}

// ─── LLM-based Learning Extraction ────────────────────────
// Asks the model to pull out durable facts about THIS client's business —
// the kind of thing the agent should remember for future tasks. Returns []
// on failure so the caller can fall back to the heuristic extractor.
async function extractLearningsLLM(
  taskTitle: string,
  briefing: string,
  deliverable: string,
): Promise<string[]> {
  const systemPrompt = `أنت محرك تعلّم لموظف ذكاء اصطناعي. مهمتك استخراج "معلومات دائمة" عن عمل العميل من مهمة منجزة — معلومات تفيد الموظف في مهام مستقبلية.

استخرج فقط حقائق ثابتة ومحددة عن العميل: تفضيلاته، جمهوره، منتجاته، نبرة علامته التجارية، قراراته، قيوده، أو أي تفصيل يميّز عمله.

تجاهل: الحشو، النصائح العامة، أي شي ينطبق على أي عميل، وأي شي مذكور في المهمة نفسها بدون قيمة مستقبلية.

أرجع النتيجة كمصفوفة JSON من نصوص قصيرة بالعربية فقط — لا شي غير المصفوفة. مثال:
["العميل يستهدف الشباب 18-25 في السعودية", "يفضّل نبرة مرحة وغير رسمية", "ميزانيته الإعلانية محدودة"]

إذا ما فيه معلومات دائمة تستحق الحفظ، أرجع مصفوفة فارغة: []`;

  const userContent = `المهمة: ${taskTitle}

طلب العميل:
${briefing.slice(0, 1500)}

ما أنجزه الموظف:
${deliverable.slice(0, 3000)}

استخرج المعلومات الدائمة عن العميل (مصفوفة JSON فقط):`;

  return extractStructured(systemPrompt, userContent);
}

// ─── Store Feedback as Memory ─────────────────────────────

export async function storeFeedbackMemory(
  tenantId: string,
  agentId: string,
  taskId: string,
  rating: number,
  feedback: string | null,
): Promise<void> {
  const ratingText = rating >= 4
    ? 'العميل راضٍ جداً'
    : rating >= 3
      ? 'العميل راضٍ بشكل مقبول'
      : 'العميل غير راضٍ — يجب التحسين';

  let content = `تقييم ${rating}/5 — ${ratingText}`;
  if (feedback) {
    content += `. ملاحظة: "${feedback}"`;
  }

  await prisma.agentMemory.create({
    data: {
      tenantId,
      agentId,
      type: 'feedback',
      content,
      source: taskId,
      importance: rating >= 4 ? 6 : 8, // Negative feedback is more important to remember
    },
  });
}

// ─── Store User Preference from Chat ──────────────────────

export async function storePreferenceMemory(
  tenantId: string,
  agentId: string,
  preference: string,
  source?: string,
): Promise<void> {
  await prisma.agentMemory.create({
    data: {
      tenantId,
      agentId,
      type: 'user_preference',
      content: preference,
      source,
      importance: 7, // Preferences are important
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────

function extractKeyFacts(content: string): string[] {
  const facts: string[] = [];

  // Extract headings as key topics
  const headings = content.match(/^#{1,3}\s+(.+)$/gm);
  if (headings) {
    const topicSummary = headings
      .slice(0, 5)
      .map((h) => h.replace(/^#+\s+/, '').trim())
      .join('، ');
    facts.push(`المواضيع: ${topicSummary}`);
  }

  // Count tables (structured data)
  const tableCount = (content.match(/\|/g) || []).length;
  if (tableCount > 10) {
    facts.push('تضمن جداول بيانات مفصلة');
  }

  // Count bullet points
  const bulletCount = (content.match(/^[-•*]\s/gm) || []).length;
  if (bulletCount > 5) {
    facts.push(`تضمن ${bulletCount} نقطة تفصيلية`);
  }

  return facts;
}

// ─── Cleanup Old Memories (keep recent, important ones) ───

export async function pruneMemories(
  tenantId: string,
  agentId: string,
  maxMemories: number = 50,
): Promise<number> {
  const count = await prisma.agentMemory.count({
    where: { tenantId, agentId },
  });

  if (count <= maxMemories) return 0;

  // Delete oldest low-importance memories
  const toDelete = await prisma.agentMemory.findMany({
    where: { tenantId, agentId },
    orderBy: [{ importance: 'asc' }, { createdAt: 'asc' }],
    take: count - maxMemories,
    select: { id: true },
  });

  await prisma.agentMemory.deleteMany({
    where: { id: { in: toDelete.map((m) => m.id) } },
  });

  return toDelete.length;
}
