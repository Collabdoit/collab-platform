import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// GET /api/agents — List all available agents with their skills + hiring status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get('tier');
    const department = searchParams.get('department');

    const where: Record<string, unknown> = { isActive: true };
    if (tier) where.tier = tier;
    if (department) where.department = department;

    // Get tenant context (optional — if not logged in, show agents without hire status)
    const auth = await getAuthContext();
    const tenantId = auth?.tenantId;

    const agents = await prisma.agent.findMany({
      where,
      include: {
        skills: {
          select: {
            id: true, nameAr: true, nameEn: true,
            descriptionAr: true, descriptionEn: true,
            icon: true, estimatedTime: true,
          },
        },
        hiredBy: tenantId ? {
          where: { tenantId, firedAt: null },
          select: { id: true, agreedSalary: true, hiredAt: true },
        } : false,
        _count: { select: { hiredBy: true } },
      },
      orderBy: { salary: 'asc' },
    });

    // Flatten hiring status for the tenant
    const result = agents.map(agent => ({
      id: agent.id,
      nameAr: agent.nameAr,
      nameEn: agent.nameEn,
      roleAr: agent.roleAr,
      roleEn: agent.roleEn,
      avatar: agent.avatar,
      color: agent.color,
      personalityAr: agent.personalityAr,
      departmentAr: agent.departmentAr,
      department: agent.department,
      tier: agent.tier,
      salary: agent.salary,
      minSalary: agent.minSalary,
      aiProvider: agent.aiProvider,
      skills: agent.skills,
      isHired: Array.isArray(agent.hiredBy) && agent.hiredBy.length > 0,
      agreedSalary: Array.isArray(agent.hiredBy) && agent.hiredBy.length > 0 ? agent.hiredBy[0].agreedSalary : null,
      totalHires: agent._count.hiredBy,
    }));

    return NextResponse.json({ agents: result });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات الموظفين' }, { status: 500 });
  }
}
