import { NextRequest, NextResponse } from 'next/server';
import { callAIChat, type ChatMessage, type AIProvider } from '@/lib/anthropic';

// POST /api/agents/chat — Direct chat with an agent (no task/DB, lightweight)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, agentName, systemPrompt, provider, model } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'الرسائل مطلوبة' }, { status: 400 });
    }

    // Build system prompt for the agent
    const defaultSystemPrompt = `أنت ${agentName || 'موظف ذكي'}، موظف ذكاء اصطناعي محترف في منصة كولاب.
أنت تتحدث باللغة العربية بلهجة سعودية مهنية وودية.
ساعد المستخدم في طلبه بأفضل طريقة ممكنة.
قدّم إجابات مفصّلة وعملية.
إذا كان الطلب يتعلق بالتسويق أو المحتوى، اربط إجابتك بالسوق السعودي.`;

    const chatMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'agent' ? 'assistant' as const : m.role as 'user' | 'system',
      content: m.content,
    }));

    const result = await callAIChat(
      chatMessages,
      systemPrompt || defaultSystemPrompt,
      (provider as AIProvider) || undefined,
      model || undefined,
    );

    return NextResponse.json({
      reply: result.content,
      model: result.model,
      provider: result.provider,
      isDemo: result.isDemo,
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    return NextResponse.json({ error: 'فشل في الرد' }, { status: 500 });
  }
}
