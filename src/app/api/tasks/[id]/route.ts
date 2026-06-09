import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks/[id] — Get task detail with deliverable
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
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
            descriptionAr: true,
            descriptionEn: true,
          },
        },
        deliverable: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'المهمة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'فشل في جلب تفاصيل المهمة' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] — Rate a deliverable
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, feedback } = body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { deliverable: true },
    });

    if (!task || !task.deliverable) {
      return NextResponse.json(
        { error: 'المهمة أو التسليم غير موجود' },
        { status: 404 }
      );
    }

    const updatedDeliverable = await prisma.deliverable.update({
      where: { id: task.deliverable.id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(feedback !== undefined && { feedback }),
      },
    });

    return NextResponse.json({ deliverable: updatedDeliverable });
  } catch (error) {
    console.error('Error updating deliverable:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث التقييم' },
      { status: 500 }
    );
  }
}
