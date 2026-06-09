import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { evaluateOffer } from '@/lib/pricing';

// POST /api/interviews/[id]/negotiate — Propose a salary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { proposedSalary } = body;

    if (!proposedSalary || typeof proposedSalary !== 'number') {
      return NextResponse.json({ error: 'يجب تحديد الراتب المقترح' }, { status: 400 });
    }

    // Get interview with agent
    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!interview) {
      return NextResponse.json({ error: 'المقابلة غير موجودة' }, { status: 404 });
    }

    if (interview.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'المقابلة منتهية' }, { status: 400 });
    }

    const agent = interview.agent;
    const result = evaluateOffer(proposedSalary, agent.salary, agent.minSalary);

    // Generate agent response
    let responseMessage: string;
    
    switch (result.responseType) {
      case 'accept_happy':
        responseMessage = generateHappyAccept(agent.nameAr, proposedSalary);
        await prisma.interview.update({
          where: { id },
          data: { agreedSalary: proposedSalary, status: 'HIRED' },
        });
        break;
        
      case 'accept_reluctant':
        responseMessage = generateReluctantAccept(agent.nameAr, proposedSalary, agent.salary);
        await prisma.interview.update({
          where: { id },
          data: { agreedSalary: proposedSalary, status: 'HIRED' },
        });
        break;
        
      case 'counter':
        responseMessage = generateCounter(agent.nameAr, proposedSalary, result.counterOffer!, agent.salary);
        break;
        
      case 'reject':
        responseMessage = generateReject(agent.nameAr, proposedSalary, agent.minSalary);
        break;
    }

    // Save negotiation messages
    await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: 'user',
        content: `💰 عرض راتب: ${proposedSalary} ر.س شهرياً`,
      },
    });

    await prisma.interviewMessage.create({
      data: {
        interviewId: id,
        role: 'agent',
        content: responseMessage,
      },
    });

    return NextResponse.json({
      result: {
        accepted: result.accepted,
        responseType: result.responseType,
        proposedSalary,
        counterOffer: result.counterOffer,
        agreedSalary: result.accepted ? proposedSalary : null,
        agentResponse: responseMessage,
      },
    });
  } catch (error) {
    console.error('Negotiation error:', error);
    return NextResponse.json({ error: 'فشل في معالجة العرض' }, { status: 500 });
  }
}

function generateHappyAccept(name: string, salary: number): string {
  return `🎉 ممتاز! عرض رائع!\n\n${salary} ر.س شهرياً؟ أنا سعيد/ة جداً بهذا العرض! هذا يعكس تقديرك لخبرتي ومهاراتي.\n\nأنا ${name}، وأعدك بأنني سأقدم أفضل ما عندي. يشرفني الانضمام لفريقك! 🤝\n\n✅ **تم الاتفاق على الراتب: ${salary} ر.س/شهرياً**\n\n_اضغط "توظيف" لإتمام التعاقد!_`;
}

function generateReluctantAccept(name: string, salary: number, baseSalary: number): string {
  return `🤔 حسناً...\n\nبصراحة، ${salary} ر.س أقل من راتبي المعتاد (${baseSalary} ر.س)، لكنني أقدّر الفرصة وأؤمن بأن التعاون بيننا سيكون مثمراً.\n\nسأقبل هذا العرض كاستثمار في علاقة عمل طويلة المدى. لكن أتوقع أن نراجع الراتب بعد فترة تجريبية ناجحة 📈\n\n✅ **تم الاتفاق على الراتب: ${salary} ر.س/شهرياً**\n\n_اضغط "توظيف" لإتمام التعاقد!_`;
}

function generateCounter(name: string, proposed: number, counter: number, base: number): string {
  return `💭 أقدّر عرضك...\n\n${proposed} ر.س؟ هذا أقل من المتوقع بالنسبة لخبرتي ومهاراتي. راتبي الأساسي هو ${base} ر.س.\n\nلكن لأنني أشوف إمكانيات حقيقية في التعاون معك، خلني أقدم لك عرض مقابل:\n\n💡 **عرضي المقابل: ${counter} ر.س/شهرياً**\n\nهذا سعر خاص وعادل للطرفين. ما رأيك؟ 🤝`;
}

function generateReject(name: string, proposed: number, minSalary: number): string {
  return `😔 عذراً...\n\n${proposed} ر.س أقل بكثير من الحد الأدنى الذي أقبله. أحترم ميزانيتك، لكن هذا الراتب لا يعكس قيمة خبرتي ومهاراتي.\n\nأقل راتب يمكنني قبوله هو **${minSalary} ر.س/شهرياً** — وهذا سعر مخفّض خصيصاً لك!\n\nهل تريد تقديم عرض جديد؟ 🤔`;
}
