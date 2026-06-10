import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// GET /api/documents — List all documents for tenant
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth?.tenantId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const type = request.nextUrl.searchParams.get('type');
    const source = request.nextUrl.searchParams.get('source');

    const where: Record<string, unknown> = { tenantId: auth.tenantId };
    if (type) where.type = type;
    if (source) where.source = source;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json({ documents: [] });
  }
}

// DELETE /api/documents — Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth?.tenantId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({
      where: { id, tenantId: auth.tenantId },
    });

    if (!doc) {
      return NextResponse.json({ error: 'المستند غير موجود' }, { status: 404 });
    }

    // Delete from Vercel Blob
    try {
      await del(doc.url);
    } catch {
      console.error('Failed to delete blob, continuing with DB cleanup');
    }

    // Delete from database
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'فشل في حذف المستند' }, { status: 500 });
  }
}
