import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

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
          },
        },
      },
    });

    const totalTasks = await prisma.task.count({ where: { tenantId: auth.tenantId } });
    const completedTasks = await prisma.task.count({ where: { tenantId: auth.tenantId, status: 'COMPLETED' } });
    const memoryCount = await prisma.agentMemory.count({ where: { tenantId: auth.tenantId } });
    const knowledgeCount = await prisma.tenantKnowledge.count({ where: { tenantId: auth.tenantId, isActive: true } });

    return NextResponse.json({
      subscription: subscription || {
        tier: 'FREE', monthlyBudget: 0, tokensBudget: 10000, tokensUsed: 0,
      },
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
