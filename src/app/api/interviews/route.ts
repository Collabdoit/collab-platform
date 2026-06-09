import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// POST /api/interviews — Start a new interview
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId مطلوب' }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { skills: true },
    });

    if (!agent) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    const interview = await prisma.interview.create({
      data: {
        userId: auth.userId,
        tenantId: auth.tenantId,
        agentId,
        status: 'ACTIVE',
      },
    });

    const introMessage = generateIntro(agent);

    await prisma.interviewMessage.create({
      data: { interviewId: interview.id, role: 'agent', content: introMessage },
    });

    return NextResponse.json({
      interview: {
        id: interview.id,
        status: interview.status,
        agent: {
          id: agent.id, nameAr: agent.nameAr, roleAr: agent.roleAr,
          avatar: agent.avatar, color: agent.color, salary: agent.salary,
          minSalary: agent.minSalary, tier: agent.tier, personalityAr: agent.personalityAr,
          skills: agent.skills.map(s => ({ id: s.id, nameAr: s.nameAr, icon: s.icon })),
        },
        messages: [{ id: 'intro', role: 'agent', content: introMessage, createdAt: new Date().toISOString() }],
      },
    });
  } catch (error) {
    console.error('Interview creation error:', error);
    return NextResponse.json({ error: 'فشل في بدء المقابلة' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateIntro(agent: any): string {
  const intros: Record<string, string> = {
    'نورة': `السلام عليكم!\n\nأنا نورة، أخصائية استراتيجية المحتوى. سعيدة جداً بفرصة المقابلة!\n\nأنا متخصصة في تخطيط المحتوى الرقمي وجدولته، مع خبرة عميقة في السوق السعودي.\n\nمهاراتي الأساسية:\n- تقويم المحتوى\n- هيكل المقالات\n- خطاطيف السوشيال ميديا\n\nكيف يمكنني مساعدتك اليوم؟`,
    'فهد': `يا هلا والله!\n\nأنا فهد، كاتب إعلانات إبداعي. حياك الله في المقابلة!\n\nأنا الشخص اللي يحول الأفكار إلى عبارات تعلق في الذهن.\n\nشوف وش أقدر أسوي لك:\n- نصوص إعلانية تبيع\n- عناوين تجذب الانتباه\n- أزرار CTA تزيد التحويل\n\nقل لي، وش تحتاج بالضبط؟`,
    'ريم': `السلام عليكم!\n\nأنا ريم، محللة SEO ومتخصصة في تحسين محركات البحث.\n\nأعمل على تحسين ظهور المواقع في نتائج البحث باستخدام بيانات وتحليلات دقيقة.\n\nمجالات خبرتي:\n- تدقيق SEO شامل\n- بحث الكلمات المفتاحية\n- تحسين Meta Tags\n\nعندك أسئلة عن كيف أقدر أفيد موقعك؟`,
    'سلطان': `أهلاً وسهلاً!\n\nأنا سلطان، وأنا أؤمن أن كل علامة تجارية عظيمة وراءها قصة أعظم.\n\nعملي هو أن أحوّل رؤيتك إلى سردية تلامس القلوب وتبني الثقة.\n\nمجالات إبداعي:\n- قصة العلامة التجارية\n- صفحة "من نحن"\n- بيان المهمة والرؤية\n\nاحكِ لي عن علامتك التجارية...`,
    'لمى': `مرحباً!\n\nأنا لمى، مديرة تخطيط الحملات التسويقية — خبرة 8 سنوات في السوق السعودي.\n\nأدرت حملات بميزانيات تتجاوز مليون ريال وحققت عوائد استثنائية.\n\nما أقدمه لك:\n- استراتيجيات حملات شاملة\n- خطط وسائط مفصلة\n- توزيع ميزانيات ذكي\n\nخبّرني عن أهدافك التسويقية.`,
    'تركي': `السلام عليكم!\n\nأنا تركي، محلل أداء التسويق الرقمي.\n\nأنا أحول البيانات إلى قرارات. كل رقم يحكي قصة، ومهمتي أن أترجمها إلى خطوات عملية.\n\nتخصصاتي:\n- تحليل القمع البيعي\n- لوحات المؤشرات (KPI)\n- خطط اختبار A/B\n\nعندك بيانات تحتاج تحليل؟ أنا جاهز!`,
  };
  return intros[agent.nameAr] || `مرحباً! أنا ${agent.nameAr}، ${agent.roleAr}. سعيد/ة بالمقابلة! كيف يمكنني مساعدتك؟`;
}

// GET /api/interviews — List tenant's interviews
export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

  const interviews = await prisma.interview.findMany({
    where: { tenantId: auth.tenantId },
    include: {
      agent: true,
      messages: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ interviews });
}
