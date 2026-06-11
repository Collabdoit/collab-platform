import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// GET /api/agents/[id]/stats — Real stats for a hired agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const { id: agentId } = await params;

    // Find the hired agent for this tenant
    const hiredAgent = await prisma.hiredAgent.findFirst({
      where: { tenantId: auth.tenantId, agentId, firedAt: null },
      select: { hiredAt: true },
    });

    if (!hiredAgent) {
      return NextResponse.json({ error: 'الموظف غير موجود' }, { status: 404 });
    }

    // Fetch all tasks for this agent in this tenant
    // Task links to agent via hiredAgent relation; rating lives on Deliverable.
    const tasks = await prisma.task.findMany({
      where: { tenantId: auth.tenantId, hiredAgent: { agentId } },
      select: {
        id: true,
        status: true,
        title: true,
        createdAt: true,
        completedAt: true,
        tokensUsed: true,
        deliverable: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const completed = tasks.filter(t => t.status === 'COMPLETED');
    const failed = tasks.filter(t => t.status === 'FAILED');
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'QUEUED');

    // Stats
    const totalTasks = tasks.length;
    const completedCount = completed.length;
    const failedCount = failed.length;
    const successRate = totalTasks > 0
      ? Math.round((completedCount / (completedCount + failedCount)) * 100) || 0
      : 0;

    // Average rating (only rated tasks — rating is on the deliverable)
    const ratedTasks = completed.filter(t => t.deliverable?.rating && t.deliverable.rating > 0);
    const avgRating = ratedTasks.length > 0
      ? +(ratedTasks.reduce((sum, t) => sum + (t.deliverable?.rating || 0), 0) / ratedTasks.length).toFixed(1)
      : 0;

    // Days of service
    const hiredDate = new Date(hiredAgent.hiredAt);
    const now = new Date();
    const daysOfService = Math.max(1, Math.floor((now.getTime() - hiredDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Total tokens used
    const totalTokens = tasks.reduce((sum, t) => sum + (t.tokensUsed || 0), 0);

    // Average completion time (in minutes)
    const completionTimes = completed
      .filter(t => t.completedAt && t.createdAt)
      .map(t => (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()) / 60000);
    const avgCompletionMin = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;

    // Task history (last 20)
    const history = tasks.slice(0, 20).map(t => ({
      id: t.id,
      title: t.title,
      status: t.status,
      rating: t.deliverable?.rating || null,
      createdAt: t.createdAt,
      completedAt: t.completedAt,
    }));

    // Dynamic achievements based on real data
    const achievements: { icon: string; title: string; desc: string; color: string }[] = [];

    if (completedCount >= 1) {
      achievements.push({
        icon: '🏁',
        title: 'أول مهمة',
        desc: `أكمل أول مهمة بنجاح`,
        color: '#10B981',
      });
    }
    if (completedCount >= 10) {
      achievements.push({
        icon: '🔟',
        title: 'عشر مهام',
        desc: `أنجز ${completedCount} مهمة بنجاح`,
        color: '#6366F1',
      });
    }
    if (completedCount >= 50) {
      achievements.push({
        icon: '🏆',
        title: 'خبير متمرس',
        desc: `أنجز ${completedCount} مهمة — أداء استثنائي`,
        color: '#F59E0B',
      });
    }
    if (avgRating >= 4.5 && ratedTasks.length >= 3) {
      achievements.push({
        icon: '⭐',
        title: 'تقييم ممتاز',
        desc: `متوسط ${avgRating} نجوم من ${ratedTasks.length} تقييم`,
        color: '#F59E0B',
      });
    }
    if (successRate >= 95 && totalTasks >= 5) {
      achievements.push({
        icon: '🎯',
        title: 'معدل نجاح عالي',
        desc: `${successRate}% نجاح من ${totalTasks} مهمة`,
        color: '#10B981',
      });
    }
    if (avgCompletionMin > 0 && avgCompletionMin <= 5) {
      achievements.push({
        icon: '⚡',
        title: 'سرعة تنفيذ',
        desc: `متوسط ${avgCompletionMin} دقيقة لكل مهمة`,
        color: '#3B82F6',
      });
    }
    if (daysOfService >= 30) {
      achievements.push({
        icon: '📅',
        title: 'شهر خدمة',
        desc: `${daysOfService} يوم خدمة متواصلة`,
        color: '#8B5CF6',
      });
    }

    return NextResponse.json({
      stats: {
        totalTasks,
        completedCount,
        failedCount,
        inProgressCount: inProgress.length,
        successRate,
        avgRating,
        ratedCount: ratedTasks.length,
        daysOfService,
        totalTokens,
        avgCompletionMin,
      },
      history,
      achievements,
    });
  } catch (error) {
    console.error('Agent stats error:', error);
    return NextResponse.json({ error: 'فشل في جلب البيانات' }, { status: 500 });
  }
}
