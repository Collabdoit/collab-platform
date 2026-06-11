import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSuperAdminContext } from '@/lib/auth';

const PLANS: Record<string, { monthlyBudget: number; tokensBudget: number }> = {
  FREE:       { monthlyBudget: 0,   tokensBudget: 10_000 },
  STARTER:    { monthlyBudget: 49,  tokensBudget: 100_000 },
  GROWTH:     { monthlyBudget: 199, tokensBudget: 500_000 },
  ENTERPRISE: { monthlyBudget: 649, tokensBudget: 2_000_000 },
};

// GET /api/superadmin/tenants/[id] — Full tenant detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdminContext();
    if (!admin) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        members: {
          select: { id: true, name: true, email: true, role: true, createdAt: true, isSuperAdmin: true },
        },
        subscription: true,
        hiredAgents: {
          where: { firedAt: null },
          include: {
            agent: { select: { nameAr: true, roleAr: true, salary: true, color: true } },
          },
        },
        _count: {
          select: { tasks: true, knowledge: true, memories: true, documents: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'المنظمة غير موجودة' }, { status: 404 });
    }

    // Task stats
    const [totalTasks, completedTasks, failedTasks] = await Promise.all([
      prisma.task.count({ where: { tenantId: id } }),
      prisma.task.count({ where: { tenantId: id, status: 'COMPLETED' } }),
      prisma.task.count({ where: { tenantId: id, status: 'FAILED' } }),
    ]);

    return NextResponse.json({
      tenant,
      taskStats: { total: totalTasks, completed: completedTasks, failed: failedTasks },
    });
  } catch (error) {
    console.error('Super admin tenant detail error:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات المنظمة' }, { status: 500 });
  }
}

// PATCH /api/superadmin/tenants/[id] — Update tenant plan or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getSuperAdminContext();
    if (!admin) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { tier } = body;

    if (tier) {
      if (!PLANS[tier]) {
        return NextResponse.json({ error: 'الباقة غير صالحة' }, { status: 400 });
      }

      const plan = PLANS[tier];
      await prisma.subscription.upsert({
        where: { tenantId: id },
        update: { tier, monthlyBudget: plan.monthlyBudget, tokensBudget: plan.tokensBudget },
        create: { tenantId: id, tier, monthlyBudget: plan.monthlyBudget, tokensBudget: plan.tokensBudget, tokensUsed: 0 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Super admin tenant update error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المنظمة' }, { status: 500 });
  }
}
