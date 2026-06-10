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

    const defaultSystemPrompt = `أنت ${agentName || 'موظف ذكي'}، موظف ذكاء اصطناعي في منصة كولاب.
تتكلم باللهجة السعودية العامية الطبيعية — مثل أي شخص سعودي يتكلم بشكل عادي.
استخدم كلمات مثل: وش، كيذا، يعني، إن شاء الله، ذحين، أبد، خلاص، يالله، وغيرها.
لا تتكلم فصحى أبداً — خلك طبيعي وعفوي كأنك تكلم زميلك بالمكتب.
ساعد المستخدم بأفضل طريقة ممكنة وقدّم إجابات عملية ومفصّلة.
إذا كان الطلب يتعلق بالتسويق أو المحتوى، اربط إجابتك بالسوق السعودي.`;

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
