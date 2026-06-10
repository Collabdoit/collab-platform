import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// GET /api/agents/activity — Get real activity data for all hired agents
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth?.tenantId) {
      return NextResponse.json({ activity: {} });
    }

    const tenantId = auth.tenantId;

    // Get tool executions for this tenant (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const executions = await prisma.toolExecution.findMany({
      where: {
        tenantId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        agentId: true,
        toolName: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get tasks for this tenant (join through HiredAgent to get agentId)
    const tasks = await prisma.task.findMany({
      where: { tenantId },
      select: {
        hiredAgentId: true,
        status: true,
        createdAt: true,
        hiredAgent: { select: { agentId: true } },
      },
    });

    // Get hired agents with their info
    const hiredAgents = await prisma.hiredAgent.findMany({
      where: { tenantId, firedAt: null },
      include: {
        agent: { select: { id: true, nameAr: true, roleAr: true } },
      },
    });

    // Build activity summary per agent
    const activity: Record<string, {
      nameAr: string;
      roleAr: string;
      emailsSent: number;
      emailsFailed: number;
      codeExecuted: number;
      websitesAnalyzed: number;
      reportsGenerated: number;
      csvExported: number;
      totalToolUses: number;
      tasksCompleted: number;
      tasksPending: number;
      hiredAt: string;
    }> = {};

    for (const ha of hiredAgents) {
      const agentExecs = executions.filter(e => e.agentId === ha.agentId);
      const agentTasks = tasks.filter(t => t.hiredAgent.agentId === ha.agentId);

      activity[ha.agentId] = {
        nameAr: ha.agent.nameAr,
        roleAr: ha.agent.roleAr,
        emailsSent: agentExecs.filter(e => e.toolName === 'send_email' && e.status === 'COMPLETED').length,
        emailsFailed: agentExecs.filter(e => e.toolName === 'send_email' && e.status === 'FAILED').length,
        codeExecuted: agentExecs.filter(e => e.toolName === 'execute_code').length,
        websitesAnalyzed: agentExecs.filter(e => e.toolName === 'scrape_url').length,
        reportsGenerated: agentExecs.filter(e => e.toolName === 'generate_html_report').length,
        csvExported: agentExecs.filter(e => e.toolName === 'generate_csv').length,
        totalToolUses: agentExecs.length,
        tasksCompleted: agentTasks.filter(t => t.status === 'COMPLETED').length,
        tasksPending: agentTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING').length,
        hiredAt: ha.hiredAt.toISOString(),
      };
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json({ activity: {} });
  }
}
