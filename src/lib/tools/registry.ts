// ─── Tool Registry & Executor ─────────────────────────────
// Central registry for all tools. Handles execution, approval, and logging.

import prisma from '../prisma';
import type { ToolDefinition, ToolContext, ToolResult, ToolCall, ToolParams } from './types';
import { sendEmailTool, generateEmailPreview } from './email';
import { executeCodeTool } from './code-executor';
import { scrapeUrlTool } from './web';
import { generateCsvTool, generateJsonTool, generateHtmlReportTool } from './files';

// ─── Tool Definitions ─────────────────────────────────────

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  send_email: {
    name: 'send_email',
    nameAr: 'إرسال بريد إلكتروني',
    description: 'Send an email via Resend',
    descriptionAr: 'إرسال بريد إلكتروني حقيقي للعميل أو جهة اتصال',
    icon: '📧',
    requiresApproval: true,
    paramSchema: {
      to: { type: 'string', required: true, descriptionAr: 'البريد الإلكتروني للمستلم' },
      subject: { type: 'string', required: true, descriptionAr: 'عنوان الرسالة' },
      body: { type: 'string', required: true, descriptionAr: 'نص الرسالة' },
    },
    handler: sendEmailTool,
  },

  execute_code: {
    name: 'execute_code',
    nameAr: 'تنفيذ كود',
    description: 'Execute JavaScript code in a sandboxed environment',
    descriptionAr: 'تنفيذ كود JavaScript في بيئة آمنة',
    icon: '💻',
    requiresApproval: false,
    paramSchema: {
      code: { type: 'string', required: true, descriptionAr: 'الكود المراد تنفيذه' },
      language: { type: 'string', required: false, descriptionAr: 'لغة البرمجة (javascript)' },
    },
    handler: executeCodeTool,
  },

  scrape_url: {
    name: 'scrape_url',
    nameAr: 'تحليل موقع',
    description: 'Fetch and analyze a web page',
    descriptionAr: 'جلب وتحليل صفحة ويب (SEO, محتوى, بنية)',
    icon: '🌐',
    requiresApproval: false,
    paramSchema: {
      url: { type: 'string', required: true, descriptionAr: 'رابط الموقع' },
    },
    handler: scrapeUrlTool,
  },

  generate_csv: {
    name: 'generate_csv',
    nameAr: 'إنشاء ملف CSV',
    description: 'Generate a CSV file from structured data',
    descriptionAr: 'إنشاء ملف CSV من بيانات منظمة',
    icon: '📊',
    requiresApproval: false,
    paramSchema: {
      headers: { type: 'array', required: true, descriptionAr: 'أسماء الأعمدة' },
      rows: { type: 'array', required: true, descriptionAr: 'صفوف البيانات' },
      filename: { type: 'string', required: false, descriptionAr: 'اسم الملف' },
    },
    handler: generateCsvTool,
  },

  generate_json: {
    name: 'generate_json',
    nameAr: 'إنشاء ملف JSON',
    description: 'Generate a JSON file from data',
    descriptionAr: 'إنشاء ملف JSON من بيانات',
    icon: '📋',
    requiresApproval: false,
    paramSchema: {
      data: { type: 'object', required: true, descriptionAr: 'البيانات' },
      filename: { type: 'string', required: false, descriptionAr: 'اسم الملف' },
    },
    handler: generateJsonTool,
  },

  generate_html_report: {
    name: 'generate_html_report',
    nameAr: 'إنشاء تقرير HTML',
    description: 'Generate a styled HTML report',
    descriptionAr: 'إنشاء تقرير HTML منسق وجاهز للتحميل',
    icon: '📄',
    requiresApproval: false,
    paramSchema: {
      title: { type: 'string', required: true, descriptionAr: 'عنوان التقرير' },
      sections: { type: 'array', required: true, descriptionAr: 'أقسام التقرير' },
    },
    handler: generateHtmlReportTool,
  },
};

// ─── Parse Tool Calls from AI Response ────────────────────

const TOOL_CALL_REGEX = /\[TOOL:(\w+)\]\s*```json\s*([\s\S]*?)```/g;
const TOOL_CALL_SIMPLE = /\[TOOL:(\w+)\]\s*(\{[\s\S]*?\})\s*\[\/TOOL\]/g;

export function parseToolCalls(aiResponse: string): ToolCall[] {
  const calls: ToolCall[] = [];
  let match;

  // Try fenced code block format first: [TOOL:name]```json{...}```
  const regex1 = new RegExp(TOOL_CALL_REGEX.source, 'g');
  while ((match = regex1.exec(aiResponse)) !== null) {
    try {
      const params = JSON.parse(match[2].trim());
      calls.push({
        toolName: match[1],
        params,
        id: `tc_${Date.now()}_${calls.length}`,
      });
    } catch {
      console.error(`Failed to parse tool params for ${match[1]}`);
    }
  }

  // Try simple format: [TOOL:name]{...}[/TOOL]
  if (calls.length === 0) {
    const regex2 = new RegExp(TOOL_CALL_SIMPLE.source, 'g');
    while ((match = regex2.exec(aiResponse)) !== null) {
      try {
        const params = JSON.parse(match[2].trim());
        calls.push({
          toolName: match[1],
          params,
          id: `tc_${Date.now()}_${calls.length}`,
        });
      } catch {
        console.error(`Failed to parse tool params for ${match[1]}`);
      }
    }
  }

  return calls;
}

// ─── Strip Tool Calls from AI Text ────────────────────────

export function stripToolCalls(aiResponse: string): string {
  return aiResponse
    .replace(TOOL_CALL_REGEX, '')
    .replace(TOOL_CALL_SIMPLE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Execute a Single Tool ────────────────────────────────

export async function executeTool(
  toolName: string,
  params: ToolParams,
  context: ToolContext,
): Promise<{ result: ToolResult; executionId: string }> {
  const definition = TOOL_DEFINITIONS[toolName];

  if (!definition) {
    return {
      result: { success: false, output: `أداة غير معروفة: ${toolName}` },
      executionId: '',
    };
  }

  // Create execution record
  const execution = await prisma.toolExecution.create({
    data: {
      taskId: context.taskId || null,
      tenantId: context.tenantId,
      agentId: context.agentId,
      toolName,
      params: JSON.stringify(params),
      status: definition.requiresApproval ? 'PENDING' : 'RUNNING',
    },
  });

  // If requires approval, don't execute yet
  if (definition.requiresApproval) {
    const previewData = toolName === 'send_email'
      ? generateEmailPreview(params)
      : params;

    return {
      result: {
        success: true,
        output: `⏳ في انتظار الموافقة — ${definition.nameAr}`,
        requiresApproval: true,
        previewData,
      },
      executionId: execution.id,
    };
  }

  // Execute directly
  try {
    const result = await definition.handler(params, context);

    await prisma.toolExecution.update({
      where: { id: execution.id },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        result: JSON.stringify(result),
        error: result.success ? null : result.output,
        completedAt: new Date(),
      },
    });

    return { result, executionId: execution.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    await prisma.toolExecution.update({
      where: { id: execution.id },
      data: {
        status: 'FAILED',
        error: errorMsg,
        completedAt: new Date(),
      },
    });

    return {
      result: { success: false, output: `❌ فشل تنفيذ ${definition.nameAr}: ${errorMsg}` },
      executionId: execution.id,
    };
  }
}

// ─── Approve & Execute a Pending Tool ─────────────────────

export async function approveAndExecuteTool(executionId: string): Promise<ToolResult> {
  const execution = await prisma.toolExecution.findUnique({
    where: { id: executionId },
  });

  if (!execution) {
    return { success: false, output: 'العملية غير موجودة' };
  }

  if (execution.status !== 'PENDING') {
    return { success: false, output: `العملية حالتها ${execution.status}، ليست في انتظار الموافقة` };
  }

  const definition = TOOL_DEFINITIONS[execution.toolName];
  if (!definition) {
    return { success: false, output: `أداة غير معروفة: ${execution.toolName}` };
  }

  // Update status to RUNNING
  await prisma.toolExecution.update({
    where: { id: executionId },
    data: { status: 'APPROVED' },
  });

  // Execute
  try {
    const params = JSON.parse(execution.params);
    const context: ToolContext = {
      tenantId: execution.tenantId,
      agentId: execution.agentId,
      agentName: '', // Will be populated if needed
      taskId: execution.taskId || undefined,
    };

    await prisma.toolExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' },
    });

    const result = await definition.handler(params, context);

    await prisma.toolExecution.update({
      where: { id: executionId },
      data: {
        status: result.success ? 'COMPLETED' : 'FAILED',
        result: JSON.stringify(result),
        error: result.success ? null : result.output,
        completedAt: new Date(),
      },
    });

    return result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';

    await prisma.toolExecution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED',
        error: errorMsg,
        completedAt: new Date(),
      },
    });

    return { success: false, output: `❌ فشل التنفيذ: ${errorMsg}` };
  }
}

// ─── Reject a Pending Tool ────────────────────────────────

export async function rejectToolExecution(executionId: string): Promise<void> {
  await prisma.toolExecution.update({
    where: { id: executionId },
    data: { status: 'REJECTED', completedAt: new Date() },
  });
}

// ─── Build Tool Instructions for AI Prompt ────────────────

export function buildToolInstructions(availableTools: string[]): string {
  const tools = availableTools
    .map(name => TOOL_DEFINITIONS[name])
    .filter(Boolean);

  if (tools.length === 0) return '';

  const toolDescriptions = tools.map(t => {
    const params = Object.entries(t.paramSchema)
      .map(([key, schema]) => `    "${key}": "${schema.descriptionAr}"${schema.required ? ' (مطلوب)' : ''}`)
      .join(',\n');

    return `- ${t.name} (${t.nameAr}): ${t.descriptionAr}
  البارامترات:
${params}`;
  }).join('\n\n');

  return `

--- الأدوات المتاحة ---
يمكنك استخدام الأدوات التالية لتنفيذ مهام حقيقية. لاستدعاء أداة، استخدم هذا التنسيق بالضبط:

[TOOL:اسم_الأداة]
\`\`\`json
{
  "param1": "value1",
  "param2": "value2"
}
\`\`\`

الأدوات المتاحة:
${toolDescriptions}

قواعد مهمة:
- استخدم الأدوات فقط عندما يطلب المستخدم ذلك أو عندما يكون واضحاً أنها مطلوبة
- يمكنك استخدام أكثر من أداة في رد واحد
- أكمل ردّك بشكل طبيعي بالإضافة لاستدعاء الأداة
- لا تختلق بريد إلكتروني — اسأل المستخدم عن البريد المطلوب
--- نهاية الأدوات ---

`;
}
