import prisma from './prisma';
import { callAI } from './anthropic';

// ─── Types ────────────────────────────────────────────────
interface TaskRunnerInput {
  taskId: string;
}

interface TaskRunnerResult {
  success: boolean;
  deliverableId?: string;
  error?: string;
}

// ─── Main Task Runner ─────────────────────────────────────
export async function runTask(input: TaskRunnerInput): Promise<TaskRunnerResult> {
  const { taskId } = input;

  try {
    // 1. Fetch the task with all related data
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        hiredAgent: {
          include: {
            agent: true,
          },
        },
        skill: true,
      },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    if (task.status !== 'QUEUED') {
      return { success: false, error: `Task is ${task.status}, not QUEUED` };
    }

    const { hiredAgent, skill } = task;
    const { agent } = hiredAgent;

    // 2. Update task status to IN_PROGRESS
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // 3. Update hired agent status to WORKING
    await prisma.hiredAgent.update({
      where: { id: hiredAgent.id },
      data: { status: 'WORKING' },
    });

    // 4. Call AI
    const aiResponse = await callAI({
      systemPrompt: agent.systemPrompt,
      skillInstruction: skill.instruction,
      userBriefing: task.briefing,
      agentName: agent.nameAr,
    });

    // 5. Create deliverable
    const deliverable = await prisma.deliverable.create({
      data: {
        taskId: task.id,
        content: aiResponse.content,
        format: skill.outputFormat,
      },
    });

    // 6. Update task status to COMPLETED + record tokens
    const tokensConsumed = aiResponse.tokensUsed || 4000; // estimate if demo
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        tokensUsed: tokensConsumed,
      },
    });

    // 7. Update hired agent status back to IDLE
    await prisma.hiredAgent.update({
      where: { id: hiredAgent.id },
      data: { status: 'IDLE' },
    });

    // 8. Update subscription token usage
    await prisma.subscription.updateMany({
      where: { userId: task.userId },
      data: {
        tokensUsed: { increment: tokensConsumed },
      },
    });

    return {
      success: true,
      deliverableId: deliverable.id,
    };
  } catch (error) {
    console.error('Task runner error:', error);

    // Mark task as FAILED
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'FAILED' },
      });

      // Reset agent status
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: { hiredAgentId: true },
      });
      if (task) {
        await prisma.hiredAgent.update({
          where: { id: task.hiredAgentId },
          data: { status: 'IDLE' },
        });
      }
    } catch (updateError) {
      console.error('Failed to update task status after error:', updateError);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
