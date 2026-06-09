import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateTenant } from '@/lib/tenant';

// GET /api/billing — Get tenant's subscription and billing info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');

    // Resolve tenant
    const resolvedTenantId = tenantId || (userId ? await getOrCreateTenant(userId) : null);

    if (!resolvedTenantId) {
      return NextResponse.json(
        { error: 'userId أو tenantId مطلوب' },
        { status: 400 }
      );
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: resolvedTenantId },
    });

    // Get active hired agents with salaries
    const hiredAgents = await prisma.hiredAgent.findMany({
      where: { tenantId: resolvedTenantId, firedAt: null },
      include: {
        agent: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            avatar: true,
            roleAr: true,
            roleEn: true,
            salary: true,
            tier: true,
          },
        },
      },
    });

    // Calculate stats
    const totalTasks = await prisma.task.count({
      where: { tenantId: resolvedTenantId },
    });

    const completedTasks = await prisma.task.count({
      where: { tenantId: resolvedTenantId, status: 'COMPLETED' },
    });

    // Memory stats
    const memoryCount = await prisma.agentMemory.count({
      where: { tenantId: resolvedTenantId },
    });

    const knowledgeCount = await prisma.tenantKnowledge.count({
      where: { tenantId: resolvedTenantId, isActive: true },
    });

    return NextResponse.json({
      subscription: subscription || {
        tier: 'FREE',
        monthlyBudget: 0,
        tokensBudget: 10000,
        tokensUsed: 0,
      },
      payroll: hiredAgents.map((ha) => ({
        agentId: ha.agent.id,
        nameAr: ha.agent.nameAr,
        nameEn: ha.agent.nameEn,
        avatar: ha.agent.avatar,
        roleAr: ha.agent.roleAr,
        roleEn: ha.agent.roleEn,
        salary: ha.agreedSalary || ha.agent.salary,
        tier: ha.agent.tier,
        hiredAt: ha.hiredAt,
      })),
      stats: {
        totalAgents: hiredAgents.length,
        totalTasks,
        completedTasks,
        monthlyBudget: subscription?.monthlyBudget || 0,
        tokensUsed: subscription?.tokensUsed || 0,
        tokensBudget: subscription?.tokensBudget || 10000,
        memoryCount,
        knowledgeCount,
      },
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الفواتير' },
      { status: 500 }
    );
  }
}
