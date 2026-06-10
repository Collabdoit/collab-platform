import prisma from './prisma';
import { callAI } from './anthropic';
import { buildEnrichedPrompt, extractTaskMemory, pruneMemories } from './memory';

// ─── Types ────────────────────────────────────────────────
interface TaskRunnerInput {
  taskId: string;
}

interface TaskRunnerResult {
  success: boolean;
  deliverableId?: string;
  error?: string;
  memoryContext?: {
    knowledgeInjected: number;
    memoriesInjected: number;
  };
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

    // 4. Build enriched prompt with tenant knowledge + agent memory
    let systemPrompt = agent.systemPrompt;
    let knowledgeCount = 0;
    let memoryCount = 0;

    if (task.tenantId) {
      const memoryContext = await buildEnrichedPrompt(
        agent.systemPrompt,
        task.tenantId,
        agent.id,
      );
      systemPrompt = memoryContext.enrichedPrompt;
      knowledgeCount = memoryContext.knowledgeCount;
      memoryCount = memoryContext.memoryCount;
    }

    // 5. Call AI with enriched context
    const aiResponse = await callAI({
      systemPrompt,
      skillInstruction: skill.instruction,
      userBriefing: task.briefing,
      agentName: agent.nameAr,
      tenantId: task.tenantId,
      agentId: agent.id,
    });

    // 6. Create deliverable
    const deliverable = await prisma.deliverable.create({
      data: {
        taskId: task.id,
        content: aiResponse.content,
        format: skill.outputFormat,
      },
    });

    // 7. Update task status to COMPLETED + record tokens
    const tokensConsumed = aiResponse.tokensUsed || 4000;
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        tokensUsed: tokensConsumed,
      },
    });

    // 8. Update hired agent status back to IDLE
    await prisma.hiredAgent.update({
      where: { id: hiredAgent.id },
      data: { status: 'IDLE' },
    });

    // 9. Update subscription token usage
    if (task.tenantId) {
      await prisma.subscription.updateMany({
        where: { tenantId: task.tenantId },
        data: {
          tokensUsed: { increment: tokensConsumed },
        },
      });
    }

    // 10. Extract and store memories from this task
    if (task.tenantId) {
      await extractTaskMemory(
        task.tenantId,
        agent.id,
        task.id,
        task.title,
        task.briefing,
        aiResponse.content,
      );

      // Prune old memories if too many
      await pruneMemories(task.tenantId, agent.id, 50);
    }

    return {
      success: true,
      deliverableId: deliverable.id,
      memoryContext: {
        knowledgeInjected: knowledgeCount,
        memoriesInjected: memoryCount,
      },
    };
  } catch (error) {
    console.error('Task runner error:', error);

    // Mark task as FAILED
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'FAILED' },
      });

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
