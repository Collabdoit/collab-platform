import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runTask } from '@/lib/task-runner';
import { getAuthContext } from '@/lib/auth';

// GET /api/tasks — List tenant's tasks
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const tasks = await prisma.task.findMany({
      where: { tenantId: auth.tenantId },
      include: {
        user: { select: { name: true, email: true } },
        hiredAgent: {
          include: {
            agent: {
              select: {
                id: true, nameAr: true, nameEn: true,
                avatar: true, color: true, roleAr: true, roleEn: true,
              },
            },
          },
        },
        skill: { select: { id: true, nameAr: true, nameEn: true, icon: true } },
        deliverable: { select: { id: true, format: true, rating: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'فشل في جلب المهام' }, { status: 500 });
  }
}

// POST /api/tasks — Create and execute a new task
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { hiredAgentId, skillId, title, briefing, priority } = body;

    if (!hiredAgentId || !skillId || !title || !briefing) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    // Verify the hired agent belongs to this tenant
    const hiredAgent = await prisma.hiredAgent.findFirst({
      where: { id: hiredAgentId, tenantId: auth.tenantId, firedAt: null },
    });

    if (!hiredAgent) {
      return NextResponse.json({ error: 'الموظف غير موظف لديك' }, { status: 404 });
    }

    // Check token budget. SECURITY: a tenant with no subscription row must be
    // treated as having NO budget — not unlimited.
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: auth.tenantId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'لا يوجد اشتراك نشط. يرجى ترقية اشتراكك.' },
        { status: 402 }
      );
    }

    const maxAllowed = Math.floor(subscription.tokensBudget * (1 + subscription.maxOverage));
    if (subscription.tokensUsed >= maxAllowed) {
      return NextResponse.json(
        { error: 'لقد استنفدت رصيد الرموز. يرجى ترقية اشتراكك.' },
        { status: 429 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        userId: auth.userId,
        tenantId: auth.tenantId,
        hiredAgentId,
        skillId,
        title,
        briefing,
        priority: priority || 'NORMAL',
        status: 'QUEUED',
      },
    });

    // Execute the task
    const result = await runTask({ taskId: task.id });

    const completedTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        hiredAgent: { include: { agent: { select: { nameAr: true, nameEn: true, avatar: true, color: true } } } },
        skill: { select: { nameAr: true, nameEn: true, icon: true } },
        deliverable: true,
      },
    });

    return NextResponse.json({ task: completedTask, executionResult: result }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المهمة' }, { status: 500 });
  }
}
