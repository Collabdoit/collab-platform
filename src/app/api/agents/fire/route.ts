import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/agents/fire — Fire (terminate) an agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, agentId } = body;

    if (!userId || !agentId) {
      return NextResponse.json(
        { error: 'userId و agentId مطلوبان' },
        { status: 400 }
      );
    }

    // Find the active hire
    const hiredAgent = await prisma.hiredAgent.findUnique({
      where: {
        userId_agentId: { userId, agentId },
      },
    });

    if (!hiredAgent || hiredAgent.firedAt) {
      return NextResponse.json(
        { error: 'هذا الموظف غير موظف حالياً' },
        { status: 404 }
      );
    }

    // Check if agent has pending tasks
    const pendingTasks = await prisma.task.count({
      where: {
        hiredAgentId: hiredAgent.id,
        status: { in: ['QUEUED', 'IN_PROGRESS'] },
      },
    });

    if (pendingTasks > 0) {
      return NextResponse.json(
        { error: 'لا يمكن إنهاء تعاقد موظف لديه مهام قيد التنفيذ' },
        { status: 409 }
      );
    }

    // Fire the agent
    const fired = await prisma.hiredAgent.update({
      where: { id: hiredAgent.id },
      data: {
        status: 'IDLE',
        firedAt: new Date(),
      },
      include: { agent: true },
    });

    // Recalculate subscription budget
    const activeHires = await prisma.hiredAgent.findMany({
      where: { userId, firedAt: null },
      include: { agent: { select: { salary: true } } },
    });

    const totalSalary = activeHires.reduce(
      (sum, hire) => sum + hire.agent.salary,
      0
    );

    await prisma.subscription.updateMany({
      where: { userId },
      data: { monthlyBudget: totalSalary },
    });

    return NextResponse.json({ firedAgent: fired });
  } catch (error) {
    console.error('Error firing agent:', error);
    return NextResponse.json(
      { error: 'فشل في إنهاء تعاقد الموظف' },
      { status: 500 }
    );
  }
}
