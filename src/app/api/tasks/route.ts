import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { runTask } from '@/lib/task-runner';

// GET /api/tasks — List user's tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId مطلوب' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
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
    return NextResponse.json(
      { error: 'فشل في جلب المهام' },
      { status: 500 }
    );
  }
}

// POST /api/tasks — Create and execute a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, hiredAgentId, skillId, title, briefing, priority } = body;

    if (!userId || !hiredAgentId || !skillId || !title || !briefing) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    // Verify the hired agent belongs to this user and is active
    const hiredAgent = await prisma.hiredAgent.findFirst({
      where: {
        id: hiredAgentId,
        userId,
        firedAt: null,
      },
    });

    if (!hiredAgent) {
      return NextResponse.json(
        { error: 'الموظف غير موظف لديك' },
        { status: 404 }
      );
    }

    // Check task limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription && subscription.tasksUsed >= subscription.tasksLimit) {
      return NextResponse.json(
        { error: 'لقد وصلت للحد الأقصى من المهام الشهرية. يرجى ترقية اشتراكك.' },
        { status: 429 }
      );
    }

    // Create the task
    const task = await prisma.task.create({
      data: {
        userId,
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
              select: {
                nameAr: true,
                nameEn: true,
                avatar: true,
              },
            },
          },
        },
        skill: {
          select: {
            nameAr: true,
            nameEn: true,
            icon: true,
          },
        },
      },
    });

    // Execute the task (async, don't await in production — for MVP we await)
    const result = await runTask({ taskId: task.id });

    // Fetch the completed task with deliverable
    const completedTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        hiredAgent: {
          include: {
            agent: {
              select: {
                nameAr: true,
                nameEn: true,
                avatar: true,
                color: true,
              },
            },
          },
        },
        skill: {
          select: {
            nameAr: true,
            nameEn: true,
            icon: true,
          },
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
    return NextResponse.json(
      { error: 'فشل في إنشاء المهمة' },
      { status: 500 }
    );
  }
}
