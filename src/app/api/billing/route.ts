import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/billing — Get user's subscription and billing info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId مطلوب' },
        { status: 400 }
      );
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Get active hired agents with salaries
    const hiredAgents = await prisma.hiredAgent.findMany({
      where: { userId, firedAt: null },
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
      where: { userId },
    });

    const completedTasks = await prisma.task.count({
      where: { userId, status: 'COMPLETED' },
    });

    return NextResponse.json({
      subscription: subscription || {
        tier: 'FREE',
        monthlyBudget: 0,
        tasksUsed: 0,
        tasksLimit: 5,
      },
      payroll: hiredAgents.map((ha) => ({
        agentId: ha.agent.id,
        nameAr: ha.agent.nameAr,
        nameEn: ha.agent.nameEn,
        avatar: ha.agent.avatar,
        roleAr: ha.agent.roleAr,
        roleEn: ha.agent.roleEn,
        salary: ha.agent.salary,
        tier: ha.agent.tier,
        hiredAt: ha.hiredAt,
      })),
      stats: {
        totalAgents: hiredAgents.length,
        totalTasks,
        completedTasks,
        monthlyBudget: subscription?.monthlyBudget || 0,
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
