import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// GET /api/agents/chat/history?agentId=xxx — Load chat history for agent
// POST /api/agents/chat/history — Save a message to chat history
// DELETE /api/agents/chat/history?agentId=xxx — Clear chat history

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) return NextResponse.json({ error: 'agentId مطلوب' }, { status: 400 });

    const session = await prisma.chatSession.findUnique({
      where: {
        tenantId_agentId_userId: {
          tenantId: auth.tenantId,
          agentId,
          userId: auth.userId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!session) {
      return NextResponse.json({ messages: [] });
    }

    const messages = session.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachment: m.attachmentName ? {
        name: m.attachmentName,
        url: m.attachmentUrl,
        type: m.attachmentType,
      } : undefined,
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ messages, sessionId: session.id });
  } catch (error) {
    console.error('Chat history fetch error:', error);
    return NextResponse.json({ messages: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { agentId, role, content, attachment } = body;

    if (!agentId || !role || !content) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    // Upsert session (one per tenant+agent+user)
    const session = await prisma.chatSession.upsert({
      where: {
        tenantId_agentId_userId: {
          tenantId: auth.tenantId,
          agentId,
          userId: auth.userId,
        },
      },
      create: {
        tenantId: auth.tenantId,
        agentId,
        userId: auth.userId,
        title: content.substring(0, 60),
      },
      update: {
        updatedAt: new Date(),
      },
    });

    // Save message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role,
        content,
        attachmentName: attachment?.name || null,
        attachmentUrl: attachment?.url || null,
        attachmentType: attachment?.type || null,
      },
    });

    return NextResponse.json({ messageId: message.id, sessionId: session.id });
  } catch (error) {
    console.error('Chat history save error:', error);
    return NextResponse.json({ error: 'فشل في حفظ الرسالة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const agentId = request.nextUrl.searchParams.get('agentId');
    if (!agentId) return NextResponse.json({ error: 'agentId مطلوب' }, { status: 400 });

    await prisma.chatSession.deleteMany({
      where: {
        tenantId: auth.tenantId,
        agentId,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat history clear error:', error);
    return NextResponse.json({ error: 'فشل في مسح المحادثة' }, { status: 500 });
  }
}
