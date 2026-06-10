import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth';
import { approveAndExecuteTool, rejectToolExecution } from '@/lib/tools/registry';
import prisma from '@/lib/prisma';

// POST /api/tools/approve — Approve or reject a pending tool execution
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { executionId, action } = body as { executionId: string; action: 'approve' | 'reject' };

    if (!executionId || !action) {
      return NextResponse.json({ error: 'executionId و action مطلوبان' }, { status: 400 });
    }

    // Verify execution belongs to this tenant
    const execution = await prisma.toolExecution.findFirst({
      where: { id: executionId, tenantId: auth.tenantId },
    });

    if (!execution) {
      return NextResponse.json({ error: 'العملية غير موجودة' }, { status: 404 });
    }

    if (execution.status !== 'PENDING') {
      return NextResponse.json({ error: 'العملية ليست في انتظار الموافقة' }, { status: 400 });
    }

    if (action === 'reject') {
      await rejectToolExecution(executionId);
      return NextResponse.json({ status: 'rejected', message: 'تم رفض العملية' });
    }

    // Approve and execute
    const result = await approveAndExecuteTool(executionId);

    return NextResponse.json({
      status: result.success ? 'completed' : 'failed',
      result,
    });
  } catch (error) {
    console.error('Tool approval error:', error);
    return NextResponse.json({ error: 'فشل في معالجة الطلب' }, { status: 500 });
  }
}

// GET /api/tools/approve — List pending tool executions for this tenant
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const pending = await prisma.toolExecution.findMany({
      where: { tenantId: auth.tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      pending: pending.map(p => ({
        id: p.id,
        toolName: p.toolName,
        params: JSON.parse(p.params),
        agentId: p.agentId,
        taskId: p.taskId,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching pending tools:', error);
    return NextResponse.json({ error: 'فشل في جلب العمليات' }, { status: 500 });
  }
}
