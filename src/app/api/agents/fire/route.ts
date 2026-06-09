import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// POST /api/agents/fire — Fire an agent
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId مطلوب' }, { status: 400 });
    }

    const hiredAgent = await prisma.hiredAgent.findUnique({
      where: { tenantId_agentId: { tenantId: auth.tenantId, agentId } },
    });

    if (!hiredAgent || hiredAgent.firedAt) {
      return NextResponse.json({ error: 'هذا الموظف غير موظف حالياً' }, { status: 404 });
    }

    const pendingTasks = await prisma.task.count({
      where: { hiredAgentId: hiredAgent.id, status: { in: ['QUEUED', 'IN_PROGRESS'] } },
    });

    if (pendingTasks > 0) {
      return NextResponse.json({ error: 'لا يمكن إنهاء تعاقد موظف لديه مهام قيد التنفيذ' }, { status: 409 });
    }

    const fired = await prisma.hiredAgent.update({
      where: { id: hiredAgent.id },
      data: { status: 'IDLE', firedAt: new Date() },
      include: { agent: true },
    });

    // Recalculate budget
    const activeHires = await prisma.hiredAgent.findMany({
      where: { tenantId: auth.tenantId, firedAt: null },
      include: { agent: { select: { salary: true } } },
    });
    const totalSalary = activeHires.reduce((sum, hire) => sum + (hire.agreedSalary || hire.agent.salary), 0);
    await prisma.subscription.updateMany({
      where: { tenantId: auth.tenantId },
      data: { monthlyBudget: totalSalary },
    });

    return NextResponse.json({ firedAgent: fired });
  } catch (error) {
    console.error('Error firing agent:', error);
    return NextResponse.json({ error: 'فشل في إنهاء تعاقد الموظف' }, { status: 500 });
  }
}
