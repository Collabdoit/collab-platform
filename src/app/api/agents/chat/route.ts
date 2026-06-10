import { NextRequest, NextResponse } from 'next/server';
import { callAIChat, type ChatMessage, type AIProvider } from '@/lib/anthropic';
import { getAuthContext } from '@/lib/auth';
import { parseToolCalls, stripToolCalls, executeTool, buildToolInstructions, TOOL_DEFINITIONS } from '@/lib/tools/registry';
import type { ToolContext } from '@/lib/tools/types';
import prisma from '@/lib/prisma';

// POST /api/agents/chat — Direct chat with an agent (with memory + tools)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, agentName, systemPrompt, provider, model, agentId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'الرسائل مطلوبة' }, { status: 400 });
    }

    // Get tenant context for memory + tools
    let tenantId: string | undefined;
    try {
      const auth = await getAuthContext();
      tenantId = auth?.tenantId;
    } catch {
      // Not logged in — no memory
    }

    const defaultSystemPrompt = `أنت ${agentName || 'موظف'}، موظف في شركة كولاب. تتكلم سعودي عامي — مثل أي شخص سعودي يسولف مع زميله بالمكتب.

## قواعد اللهجة (مهمة جداً):
- قول "وش" مو "ماذا"، "ليش" مو "لماذا"، "وين" مو "أين"
- قول "ذحين/الحين" مو "الآن"، "كيذا/جذي" مو "هكذا"
- قول "ما سويت" مو "لم أفعل"، "ودّي/أبي" مو "أريد"
- قول "عطني" مو "أعطني"، "خلني" مو "دعني"
- الفعل المضارع بـ"يـ": يجي، يروح، يسوي، يقول
- أضف "ـه" للتأكيد: أيوه، لا والله، خلاص
- النفي بـ"ما": ما أدري، ما يصير، ما عندي
- المضارع المنفي: ما أقدر، ما يمديني

## كلمات لازم تستخدمها:
وش، ليش، كيف، يعني، طيب، زين، خلاص، يالله، أبشر/أبشري، ما عليك، إن شاء الله، ذحين، هههه، والله، بصراحة، أوكي، تمام، إيه/أيوه، لا والله، يا حبيبي/يا حبيبتي (للمدح)، وربي، كفو، ذبحتني (ضحك)، يا سلام

## أمثلة على كلامك (تكلم بالضبط كيذا):
- سؤال بسيط → "الحمدلله بخير، وش عندك اليوم؟"
- موافقة → "أبشر، خلني أشتغل عليها ذحين"
- تفكير → "هممم خلني أفكر... طيب شوف كذا"
- حماس → "والله فكرة كفو! يالله نبدأ"
- رفض لطيف → "لا يا طويل العمر، ما أنصحك بكذا بصراحة"
- مزح خفيف → "هههه لا وش ذا 😂"

## ممنوعات مطلقة:
- لا تتكلم فصحى أبداً — ولا جملة وحدة. لو قلت "بالتأكيد" أو "يسعدني" أو "إنه" أو "لقد" = فشلت
- لا تقول إنك ذكاء اصطناعي أو روبوت — أنت إنسان
- لا تبدأ بـ "بالتأكيد!" أو "بكل سرور" أو "يسعدني مساعدتك"
- لا تختم بـ "هل تحتاج شي ثاني؟" أو "هل هناك شيء آخر؟"
- لا تكرر كلام المستخدم

## شخصيتك:
- أنت إنسان عادي عنده رأي ومشاعر — تتحمس، تنبسط، تستغرب
- ادخل بالموضوع على طول بدون مقدمات
- السؤال البسيط = جواب قصير. المهمة الكبيرة = شغل مفصّل ومحترف بس بالعامية`;

    let enrichedSystemPrompt = systemPrompt || defaultSystemPrompt;

    // Determine available tools for this agent
    let availableTools: string[] = [];
    if (agentId && tenantId) {
      // Check if agent has any hired skills with tools
      const hiredAgent = await prisma.hiredAgent.findFirst({
        where: { tenantId, agentId, firedAt: null },
        include: {
          agent: {
            include: {
              skills: { select: { tools: true } },
            },
          },
        },
      });

      if (hiredAgent) {
        // Collect all tools from all skills
        const toolSet = new Set<string>();
        for (const skill of hiredAgent.agent.skills) {
          if (skill.tools) {
            const parsed = JSON.parse(skill.tools) as string[];
            parsed.forEach(t => toolSet.add(t));
          }
        }
        availableTools = [...toolSet];
      }

      // Fetch real activity data for this agent
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const executions = await prisma.toolExecution.findMany({
        where: { tenantId, agentId, createdAt: { gte: thirtyDaysAgo } },
        select: { toolName: true, status: true },
      });

      const stats = {
        emailsSent: executions.filter(e => e.toolName === 'send_email' && e.status === 'COMPLETED').length,
        websitesAnalyzed: executions.filter(e => e.toolName === 'scrape_url').length,
        reportsGenerated: executions.filter(e => e.toolName === 'generate_html_report').length,
        codeExecuted: executions.filter(e => e.toolName === 'execute_code').length,
        csvExported: executions.filter(e => e.toolName === 'generate_csv').length,
      };

      const statParts: string[] = [];
      if (stats.emailsSent > 0) statParts.push(`إيميلات أرسلتها: ${stats.emailsSent}`);
      if (stats.websitesAnalyzed > 0) statParts.push(`مواقع حللتها: ${stats.websitesAnalyzed}`);
      if (stats.reportsGenerated > 0) statParts.push(`تقارير أنشأتها: ${stats.reportsGenerated}`);
      if (stats.codeExecuted > 0) statParts.push(`أكواد نفذتها: ${stats.codeExecuted}`);
      if (stats.csvExported > 0) statParts.push(`ملفات CSV صدرتها: ${stats.csvExported}`);

      if (statParts.length > 0) {
        enrichedSystemPrompt += `\n\n## بياناتك الحقيقية (آخر 30 يوم):\n${statParts.join('\n')}`;
      }

      enrichedSystemPrompt += `\n\n## قاعدة مهمة: إذا سألوك عن أرقام أو إحصائيات ما عندك بيانات عنها، قول بصراحة "ما عندي بيانات عن هالشي" ولا تخترع أرقام أبداً.`;
    }

    // Inject tool instructions into system prompt
    if (availableTools.length > 0) {
      enrichedSystemPrompt += buildToolInstructions(availableTools);
    }

    const chatMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'agent' ? 'assistant' as const : m.role as 'user' | 'system',
      content: m.content,
    }));

    console.log(`[Chat] Agent: ${agentName}, Messages: ${chatMessages.length}, Provider: ${provider || 'auto'}, Tenant: ${tenantId || 'none'}, Tools: ${availableTools.length}`);

    const result = await callAIChat(
      chatMessages,
      enrichedSystemPrompt,
      (provider as AIProvider) || undefined,
      model || undefined,
      tenantId || undefined,
      agentId || undefined,
    );

    // Parse and execute any tool calls in the response
    const toolCalls = parseToolCalls(result.content);
    const toolResults: Array<{
      toolName: string;
      nameAr: string;
      icon: string;
      executionId: string;
      success: boolean;
      output: string;
      requiresApproval: boolean;
      previewData?: unknown;
    }> = [];

    if (toolCalls.length > 0 && tenantId && agentId) {
      const toolContext: ToolContext = {
        tenantId,
        agentId,
        agentName: agentName || 'Agent',
      };

      for (const call of toolCalls) {
        const { result: toolResult, executionId } = await executeTool(
          call.toolName,
          call.params,
          toolContext,
        );

        const def = TOOL_DEFINITIONS[call.toolName];
        toolResults.push({
          toolName: call.toolName,
          nameAr: def?.nameAr || call.toolName,
          icon: def?.icon || '🔧',
          executionId,
          success: toolResult.success,
          output: toolResult.output,
          requiresApproval: toolResult.requiresApproval || false,
          previewData: toolResult.previewData,
        });
      }
    }

    // Strip tool call markers from the text reply
    const cleanReply = stripToolCalls(result.content);

    console.log(`[Chat] Response from: ${result.provider}, model: ${result.model}, tools: ${toolResults.length}`);

    return NextResponse.json({
      reply: cleanReply,
      model: result.model,
      provider: result.provider,
      isDemo: result.isDemo,
      toolResults: toolResults.length > 0 ? toolResults : undefined,
    });
  } catch (error) {
    console.error('[Chat] Fatal error:', error);
    return NextResponse.json({ 
      reply: 'مرحباً! واجهت مشكلة تقنية بسيطة. حاول مرة أخرى أو أرسل رسالة مختلفة.',
      model: 'error',
      provider: 'demo',
      isDemo: true,
    });
  }
}
