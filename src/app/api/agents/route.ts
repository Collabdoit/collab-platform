import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/agents — List all available agents with their skills
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const department = searchParams.get('department');

    const where: Record<string, unknown> = { isActive: true };
    if (tier) where.tier = tier;
    if (department) where.department = department;

    const agents = await prisma.agent.findMany({
      where,
      include: {
        skills: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            descriptionAr: true,
            descriptionEn: true,
            icon: true,
            estimatedTime: true,
          },
        },
        _count: {
          select: { hiredBy: true },
        },
      },
      orderBy: { salary: 'asc' },
    });

    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الموظفين' },
      { status: 500 }
    );
  }
}
