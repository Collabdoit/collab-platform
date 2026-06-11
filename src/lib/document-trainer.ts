// ─── Document Trainer ─────────────────────────────────────
// Turns an uploaded document into structured TenantKnowledge entries so the
// content actually "trains" the agents (it gets injected into every prompt).
//
// Today this handles text-readable formats (txt, csv, json). Binary formats
// (pdf, docx) need a parsing library — see extractText() for the hook.

import prisma from './prisma';
import { extractStructuredObjects } from './anthropic';

const VALID_CATEGORIES = ['brand', 'product', 'audience', 'competitor', 'guidelines'] as const;
const MAX_CHARS = 12000; // cap how much text we feed the model
const MAX_ENTRIES = 8;   // cap knowledge entries created per document

// Formats we can read as UTF-8 text right now.
const TEXT_MIME_TYPES = new Set([
  'text/plain',
  'text/csv',
  'application/json',
  'application/vnd.ms-excel', // often plain CSV in practice
]);

export function isTextExtractable(mimeType: string): boolean {
  return TEXT_MIME_TYPES.has(mimeType);
}

type KnowledgeDraft = {
  category: string;
  title: string;
  content: string;
} & Record<string, unknown>;

/**
 * Best-effort: extract text from a file buffer. Returns null if the format
 * isn't readable as text yet (e.g. PDF/Word — wire a parser in here later).
 */
async function extractText(buffer: ArrayBuffer, mimeType: string): Promise<string | null> {
  if (!isTextExtractable(mimeType)) {
    // TODO: integrate a PDF/DOCX parser (e.g. pdf-parse, mammoth) here.
    return null;
  }
  try {
    const text = new TextDecoder('utf-8').decode(buffer);
    return text.slice(0, MAX_CHARS);
  } catch {
    return null;
  }
}

/**
 * Distill raw document text into structured knowledge entries via the LLM.
 * Returns [] on any failure.
 */
async function distillKnowledgeObjects(filename: string, text: string): Promise<KnowledgeDraft[]> {
  const systemPrompt = `أنت محرك تدريب لموظفي ذكاء اصطناعي تسويقيين. مهمتك تحويل مستند رفعه العميل إلى "بطاقات معرفة" منظمة يستفيد منها الموظفون.

لكل معلومة مهمة في المستند، أنشئ بطاقة فيها:
- category: واحدة فقط من [brand, product, audience, competitor, guidelines]
- title: عنوان قصير وواضح بالعربية
- content: المعلومة نفسها بشكل مختصر ومفيد (جملتين كحد أقصى)

ركّز على: هوية العلامة، المنتجات/الخدمات، الجمهور المستهدف، المنافسين، وإرشادات التواصل.
تجاهل: الحشو، التواريخ غير المهمة، التفاصيل اللوجستية العابرة.

أرجع مصفوفة JSON من كائنات فقط — لا شي غيرها. مثال:
[{"category":"brand","title":"نبرة العلامة","content":"رسمية ومهنية مع لمسة ودّ"},{"category":"audience","title":"الجمهور المستهدف","content":"رواد أعمال سعوديون 25-40 سنة"}]

إذا ما فيه معلومات مفيدة، أرجع: []`;

  const userContent = `اسم الملف: ${filename}

محتوى المستند:
${text}

استخرج بطاقات المعرفة (مصفوفة JSON من كائنات فقط):`;

  return extractStructuredObjects<KnowledgeDraft>(
    systemPrompt,
    userContent,
    ['category', 'title', 'content'],
  );
}

/**
 * Main entry point. Reads the file, distills knowledge, and persists entries.
 * Returns the number of knowledge entries created. Never throws.
 */
export async function trainFromDocument(params: {
  tenantId: string;
  filename: string;
  mimeType: string;
  buffer: ArrayBuffer;
}): Promise<number> {
  try {
    const text = await extractText(params.buffer, params.mimeType);
    if (!text || text.trim().length < 50) return 0;

    const drafts = await distillKnowledgeObjects(params.filename, text);
    if (drafts.length === 0) return 0;

    const valid = drafts
      .filter(d => VALID_CATEGORIES.includes(d.category as typeof VALID_CATEGORIES[number]))
      .filter(d => d.title && d.content)
      .slice(0, MAX_ENTRIES);

    if (valid.length === 0) return 0;

    await prisma.tenantKnowledge.createMany({
      data: valid.map(d => ({
        tenantId: params.tenantId,
        category: d.category,
        title: d.title.slice(0, 120),
        content: d.content.slice(0, 2000),
      })),
    });

    return valid.length;
  } catch (err) {
    console.error('[trainFromDocument] failed:', err);
    return 0;
  }
}
