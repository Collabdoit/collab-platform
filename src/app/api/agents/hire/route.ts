import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateTenant } from '@/lib/tenant';

// POST /api/agents/hire — Hire an agent for a tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId, agreedSalary } = body;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'userId و agentId مطلوبان' },
        { status: 400 }
      );
    }

    // Resolve tenant
    const tenantId = await getOrCreateTenant(userId);

    // Check if agent exists
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      );
    }

    // Check if already hired by this tenant
    const existing = await prisma.hiredAgent.findUnique({
      where: {
        tenantId_agentId: { tenantId, agentId },
      },
    });

    if (existing && !existing.firedAt) {
      return NextResponse.json(
        { error: 'تم توظيف هذا الموظف مسبقاً' },
        { status: 409 }
      );
    }

    // If previously fired, reactivate
    if (existing && existing.firedAt) {
      const rehired = await prisma.hiredAgent.update({
        where: { id: existing.id },
        data: {
          status: 'IDLE',
          firedAt: null,
          hiredAt: new Date(),
          agreedSalary: agreedSalary || null,
        },
        include: { agent: true },
      });

      await updateSubscriptionBudget(tenantId);
      return NextResponse.json({ hiredAgent: rehired, action: 'rehired' });
    }

    // Create new hire
    const hiredAgent = await prisma.hiredAgent.create({
      data: {
        userId,
        tenantId,
        agentId,
        status: 'IDLE',
        agreedSalary: agreedSalary || null,
      },
      include: { agent: true },
    });

    // Ensure subscription exists and update budget
    await prisma.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        tier: 'STARTER',
        monthlyBudget: agreedSalary || agent.salary,
        tokensBudget: 100000,
      },
      update: {},
    });
    await updateSubscriptionBudget(tenantId);

    return NextResponse.json({ hiredAgent, action: 'hired' }, { status: 201 });
  } catch (error) {
    console.error('Error hiring agent:', error);
    return NextResponse.json(
      { error: 'فشل في توظيف الموظف' },
      { status: 500 }
    );
  }
}

// Helper: recalculate monthly budget from all active hires
async function updateSubscriptionBudget(tenantId: string) {
  const activeHires = await prisma.hiredAgent.findMany({
    where: { tenantId, firedAt: null },
    include: { agent: { select: { salary: true } } },
  });

  const totalSalary = activeHires.reduce(
    (sum, hire) => sum + (hire.agreedSalary || hire.agent.salary),
    0
  );

  await prisma.subscription.upsert({
    where: { tenantId },
    create: {
      tenantId,
      monthlyBudget: totalSalary,
      tier: determineTier(totalSalary),
    },
    update: {
      monthlyBudget: totalSalary,
      tier: determineTier(totalSalary),
    },
  });
}

function determineTier(totalSalary: number): string {
  if (totalSalary === 0) return 'FREE';
  if (totalSalary <= 200) return 'STARTER';
  if (totalSalary <= 500) return 'GROWTH';
  return 'ENTERPRISE';
}
