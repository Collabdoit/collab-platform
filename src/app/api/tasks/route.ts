import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runTask } from '@/lib/task-runner';
import { getOrCreateTenant } from '@/lib/tenant';

// GET /api/tasks — List tenant's tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    const status = searchParams.get('status');

    // Support both userId and tenantId queries
    const resolvedTenantId = tenantId || (userId ? await getOrCreateTenant(userId) : null);

    if (!resolvedTenantId) {
      return NextResponse.json({ error: 'userId أو tenantId مطلوب' }, { status: 400 });
    }

    const where: Record<string, unknown> = { tenantId: resolvedTenantId };
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        hiredAgent: {
          include: {
            agent: {
              select: {
                id: true,
                nameAr: true,
                nameEn: true,
                avatar: true,
                color: true,
                roleAr: true,
                roleEn: true,
              },
            },
          },
        },
        skill: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            icon: true,
          },
        },
        deliverable: {
          select: {
            id: true,
            format: true,
            rating: true,
            createdAt: true,
          },
        },
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
    const body = await request.json();
    const { userId, hiredAgentId, skillId, title, briefing, priority } = body;

    if (!userId || !hiredAgentId || !skillId || !title || !briefing) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    // Resolve tenant
    const tenantId = await getOrCreateTenant(userId);

    // Verify the hired agent belongs to this tenant and is active
    const hiredAgent = await prisma.hiredAgent.findFirst({
      where: {
        id: hiredAgentId,
        tenantId,
        firedAt: null,
      },
    });

    if (!hiredAgent) {
      return NextResponse.json({ error: 'الموظف غير موظف لديك' }, { status: 404 });
    }

    // Check token budget
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
    });

    if (subscription) {
      const maxAllowed = Math.floor(subscription.tokensBudget * (1 + subscription.maxOverage));
      if (subscription.tokensUsed >= maxAllowed) {
        return NextResponse.json(
          { error: 'لقد استنفدت رصيد الرموز. يرجى ترقية اشتراكك.' },
          { status: 429 }
        );
      }
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        userId,
        tenantId,
        hiredAgentId,
        skillId,
        title,
        briefing,
        priority: priority || 'NORMAL',
        status: 'QUEUED',
      },
      include: {
        hiredAgent: {
          include: {
            agent: {
              select: { nameAr: true, nameEn: true, avatar: true },
            },
          },
        },
        skill: {
          select: { nameAr: true, nameEn: true, icon: true },
        },
      },
    });

    // Execute the task (includes memory injection + extraction)
    const result = await runTask({ taskId: task.id });

    // Fetch the completed task with deliverable
    const completedTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        hiredAgent: {
          include: {
            agent: {
              select: { nameAr: true, nameEn: true, avatar: true, color: true },
            },
          },
        },
        skill: {
          select: { nameAr: true, nameEn: true, icon: true },
        },
        deliverable: true,
      },
    });

    return NextResponse.json(
      { task: completedTask, executionResult: result },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المهمة' }, { status: 500 });
  }
}
