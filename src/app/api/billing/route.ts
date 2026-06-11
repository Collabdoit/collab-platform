import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// Plan definitions
const PLANS: Record<string, { monthlyBudget: number; tokensBudget: number }> = {
  FREE:       { monthlyBudget: 0,   tokensBudget: 10_000 },
  STARTER:    { monthlyBudget: 49,  tokensBudget: 100_000 },
  GROWTH:     { monthlyBudget: 199, tokensBudget: 500_000 },
  ENTERPRISE: { monthlyBudget: 649, tokensBudget: 2_000_000 },
};

// GET /api/billing — Get tenant's subscription and billing info
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: auth.tenantId },
    });

    const hiredAgents = await prisma.hiredAgent.findMany({
      where: { tenantId: auth.tenantId, firedAt: null },
      include: {
        agent: {
          select: {
            id: true, nameAr: true, nameEn: true, avatar: true,
            roleAr: true, roleEn: true, salary: true, tier: true,
            aiProvider: true, color: true,
            skills: {
              select: { id: true, nameAr: true, nameEn: true, icon: true, descriptionAr: true },
            },
          },
        },
      },
    });

    const totalTasks = await prisma.task.count({ where: { tenantId: auth.tenantId } });
    const completedTasks = await prisma.task.count({ where: { tenantId: auth.tenantId, status: 'COMPLETED' } });
    const memoryCount = await prisma.agentMemory.count({ where: { tenantId: auth.tenantId } });
    const knowledgeCount = await prisma.tenantKnowledge.count({ where: { tenantId: auth.tenantId, isActive: true } });

    // Calculate actual payroll cost = sum of agreed salaries
    const payrollCost = hiredAgents.reduce(
      (sum, ha) => sum + (ha.agreedSalary || ha.agent.salary),
      0
    );

    return NextResponse.json({
      subscription: subscription || {
        tier: 'FREE', monthlyBudget: 0, tokensBudget: 10000, tokensUsed: 0,
      },
      hiredAgents: hiredAgents.map(ha => ({
        id: ha.id,
        agent: ha.agent,
        skills: ha.agent.skills || [],
      })),
      payroll: hiredAgents.map(ha => ({
        agentId: ha.agent.id,
        nameAr: ha.agent.nameAr,
        nameEn: ha.agent.nameEn,
        avatar: ha.agent.avatar,
        roleAr: ha.agent.roleAr,
        roleEn: ha.agent.roleEn,
        salary: ha.agreedSalary || ha.agent.salary,
        tier: ha.agent.tier,
        hiredAt: ha.hiredAt,
        status: ha.status,
        color: ha.agent.color,
        provider: ha.agent.aiProvider,
      })),
      stats: {
        totalAgents: hiredAgents.length,
        totalTasks, completedTasks,
        monthlyBudget: subscription?.monthlyBudget || 0,
        payrollCost,
        tokensUsed: subscription?.tokensUsed || 0,
        tokensBudget: subscription?.tokensBudget || 10000,
        memoryCount, knowledgeCount,
      },
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات الفواتير' }, { status: 500 });
  }
}

// PATCH /api/billing — Switch subscription plan
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { tier } = body;

    if (!tier || !PLANS[tier]) {
      return NextResponse.json({ error: 'الباقة غير صالحة' }, { status: 400 });
    }

    const plan = PLANS[tier];

    // Upsert subscription — create if doesn't exist, update if it does
    const subscription = await prisma.subscription.upsert({
      where: { tenantId: auth.tenantId },
      update: {
        tier,
        monthlyBudget: plan.monthlyBudget,
        tokensBudget: plan.tokensBudget,
        // Don't reset tokensUsed — they keep their usage this cycle
      },
      create: {
        tenantId: auth.tenantId,
        tier,
        monthlyBudget: plan.monthlyBudget,
        tokensBudget: plan.tokensBudget,
        tokensUsed: 0,
      },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'فشل في تغيير الباقة' }, { status: 500 });
  }
}
