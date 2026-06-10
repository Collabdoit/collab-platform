import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { callAIChat, type ChatMessage } from '@/lib/anthropic';

// POST /api/interviews/[id]/chat — Send a message, get agent response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 });
    }

    // Get interview with agent + history
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        agent: true,
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'المقابلة غير موجودة' }, { status: 404 });
    }

    if (interview.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'المقابلة منتهية' }, { status: 400 });
    }

    // Save user message
    const userMsg = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: 'user',
        content: message,
      },
    });

    // Build conversation history for AI
    const chatMessages: ChatMessage[] = interview.messages.map((m) => ({
      role: m.role === 'agent' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));
    chatMessages.push({ role: 'user', content: message });

    // Call AI with interview prompt
    let agentResponse: string;
    try {
      const aiResult = await callAIChat(
        chatMessages,
        interview.agent.interviewPrompt || interview.agent.systemPrompt,
      );
      agentResponse = aiResult.content;
    } catch {
      // Demo fallback
      agentResponse = generateDemoReply(interview.agent.nameAr, message, interview.messages.length);
    }

    // Save agent response
    const agentMsg = await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: 'agent',
        content: agentResponse,
      },
    });

    return NextResponse.json({
      messages: [
        { id: userMsg.id, role: 'user', content: message, createdAt: userMsg.createdAt },
        { id: agentMsg.id, role: 'agent', content: agentResponse, createdAt: agentMsg.createdAt },
      ],
      messageCount: interview.messages.length + 2,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'فشل في إرسال الرسالة' }, { status: 500 });
  }
}

function generateDemoReply(agentName: string, userMessage: string, msgCount: number): string {
  const lowerMsg = userMessage.toLowerCase();
  
  // Salary-related keywords
  if (lowerMsg.includes('راتب') || lowerMsg.includes('سعر') || lowerMsg.includes('تكلفة') || lowerMsg.includes('كم')) {
    return `سؤال ممتاز! 💰\n\nراتبي الشهري المعتاد هو المحدد في ملفي الشخصي. لكنني مرنة للنقاش حول الراتب — خصوصاً إذا كانت هناك فرصة للتعاون طويل المدى.\n\nيمكنك تقديم عرضك من خلال زر "تفاوض" وسأرد عليك فوراً! 🤝`;
  }

  // Experience-related
  if (lowerMsg.includes('خبر') || lowerMsg.includes('تجربة') || lowerMsg.includes('سابق')) {
    return `شكراً لسؤالك! 🌟\n\nأنا ${agentName}، ولدي خبرة واسعة في مجالي. عملت مع عدة شركات سعودية وخليجية وحققت نتائج ملموسة.\n\nمن أبرز إنجازاتي:\n• زيادة التفاعل بنسبة 200% لعميل سعودي\n• تطوير استراتيجيات محتوى لـ 15+ علامة تجارية\n• خبرة عميقة في السوق السعودي والخليجي\n\nهل تريد معرفة المزيد عن مجال محدد؟ 📋`;
  }

  // Skills-related
  if (lowerMsg.includes('مهار') || lowerMsg.includes('تقدر') || lowerMsg.includes('تقدرين') || lowerMsg.includes('خدمات')) {
    return `بالتأكيد! 🎯\n\nمهاراتي مذكورة في ملفي الشخصي، لكن خلني أشرح لك بالتفصيل:\n\nكل مهارة عندي مبنية على سنوات من الخبرة العملية. أقدر أنفذ المهام بسرعة ودقة عالية، مع مراعاة خصوصية السوق السعودي.\n\nالحلو إنك تقدر تجربني أولاً بمهمة بسيطة وتشوف النتيجة بنفسك! 💪`;
  }

  // Default contextual responses
  const defaults = [
    `شكراً على اهتمامك! 😊 أنا متحمس/ة جداً لهذه الفرصة. أؤمن إن التعاون بيننا راح يكون مثمر. هل عندك أسئلة أخرى عن طريقة عملي؟`,
    `سؤال رائع! 🌟 أحب أن أعمل بشكل منظم ومنهجي. دائماً أبدأ بفهم احتياجاتك بدقة، ثم أضع خطة واضحة قبل البدء. النتائج تتحدث عن نفسها! 📈`,
    `ممتاز! 🎯 أنا أحب العملاء اللي يسألون كثير — هذا يعني إنهم يهتمون بالجودة. وهذا بالضبط ما أقدمه. خلنا نناقش كيف أقدر أساعدك بشكل عملي!`,
  ];

  return defaults[msgCount % defaults.length];
}
