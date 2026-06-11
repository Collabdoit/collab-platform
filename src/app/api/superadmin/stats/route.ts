import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSuperAdminContext } from '@/lib/auth';

// GET /api/superadmin/stats — Platform-wide dashboard stats
export async function GET() {
  try {
    const admin = await getSuperAdminContext();
    if (!admin) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalTenants, totalUsers, totalTasks, completedTasks,
      newTenantsWeek, newTenantsMonth,
      newUsersWeek, newUsersMonth,
      subscriptions,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.tenant.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.tenant.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.subscription.findMany({
        select: { tier: true, monthlyBudget: true, tokensUsed: true, tokensBudget: true },
      }),
    ]);

    // Plan distribution
    const planCounts: Record<string, number> = { FREE: 0, STARTER: 0, GROWTH: 0, ENTERPRISE: 0 };
    let totalRevenue = 0;
    let totalTokensUsed = 0;
    let totalTokensBudget = 0;
    for (const sub of subscriptions) {
      planCounts[sub.tier] = (planCounts[sub.tier] || 0) + 1;
      totalRevenue += sub.monthlyBudget;
      totalTokensUsed += sub.tokensUsed;
      totalTokensBudget += sub.tokensBudget;
    }
    // Tenants without a subscription are FREE
    planCounts.FREE += totalTenants - subscriptions.length;

    // Recent signups
    const recentTenants = await prisma.tenant.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, slug: true, createdAt: true,
        subscription: { select: { tier: true } },
        _count: { select: { members: true, hiredAgents: true } },
      },
    });

    return NextResponse.json({
      totals: { totalTenants, totalUsers, totalTasks, completedTasks },
      growth: { newTenantsWeek, newTenantsMonth, newUsersWeek, newUsersMonth },
      plans: planCounts,
      revenue: { monthly: totalRevenue },
      tokens: { used: totalTokensUsed, budget: totalTokensBudget },
      recentTenants,
    });
  } catch (error) {
    console.error('Super admin stats error:', error);
    return NextResponse.json({ error: 'فشل في جلب الإحصائيات' }, { status: 500 });
  }
}
