import { NextRequest, NextResponse } from 'next/server';
import { callAIChat, type ChatMessage, type AIProvider } from '@/lib/anthropic';
import { getAuthContext } from '@/lib/auth';

// POST /api/agents/chat — Direct chat with an agent (with memory)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, agentName, systemPrompt, provider, model, agentId } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'الرسائل مطلوبة' }, { status: 400 });
    }

    // Get tenant context for memory
    let tenantId: string | undefined;
    try {
      const auth = await getAuthContext();
      tenantId = auth?.tenantId;
    } catch {
      // Not logged in — no memory
    }

    const defaultSystemPrompt = `أنت ${agentName || 'موظف ذكي'}، موظف ذكاء اصطناعي محترف في منصة كولاب.
أنت تتحدث باللغة العربية بلهجة سعودية مهنية وودية.
ساعد المستخدم في طلبه بأفضل طريقة ممكنة.
قدّم إجابات مفصّلة وعملية.
إذا كان الطلب يتعلق بالتسويق أو المحتوى، اربط إجابتك بالسوق السعودي.`;

    const chatMessages: ChatMessage[] = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'agent' ? 'assistant' as const : m.role as 'user' | 'system',
      content: m.content,
    }));

    console.log(`[Chat] Agent: ${agentName}, Messages: ${chatMessages.length}, Provider: ${provider || 'auto'}, Tenant: ${tenantId || 'none'}`);
    console.log(`[Chat] GEMINI_KEY exists: ${!!process.env.GEMINI_API_KEY}, GROQ_KEY exists: ${!!process.env.GROQ_API_KEY}`);

    const result = await callAIChat(
      chatMessages,
      systemPrompt || defaultSystemPrompt,
      (provider as AIProvider) || undefined,
      model || undefined,
      tenantId || undefined,
      agentId || undefined,
    );

    console.log(`[Chat] Response from: ${result.provider}, model: ${result.model}, demo: ${result.isDemo}, tokens: ${result.tokensUsed || 'N/A'}`);

    return NextResponse.json({
      reply: result.content,
      model: result.model,
      provider: result.provider,
      isDemo: result.isDemo,
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
