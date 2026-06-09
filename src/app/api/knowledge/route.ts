import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/knowledge?tenantId=xxx — List tenant knowledge
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    const category = request.nextUrl.searchParams.get('category');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId مطلوب' }, { status: 400 });
    }

    const where: Record<string, unknown> = { tenantId, isActive: true };
    if (category) where.category = category;

    const knowledge = await prisma.tenantKnowledge.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ knowledge });
  } catch (error) {
    console.error('Knowledge fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب المعرفة' }, { status: 500 });
  }
}

// POST /api/knowledge — Add knowledge item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, category, title, content } = body;

    if (!tenantId || !category || !title || !content) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    const VALID_CATEGORIES = ['brand', 'product', 'audience', 'competitor', 'guidelines'];
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `الفئة غير صالحة. الفئات المتاحة: ${VALID_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    const item = await prisma.tenantKnowledge.create({
      data: { tenantId, category, title, content },
    });

    return NextResponse.json({ knowledge: item }, { status: 201 });
  } catch (error) {
    console.error('Knowledge create error:', error);
    return NextResponse.json({ error: 'فشل في إضافة المعرفة' }, { status: 500 });
  }
}

// PUT /api/knowledge — Update knowledge item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, category, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    const item = await prisma.tenantKnowledge.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ knowledge: item });
  } catch (error) {
    console.error('Knowledge update error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المعرفة' }, { status: 500 });
  }
}

// DELETE /api/knowledge?id=xxx — Delete knowledge item
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id مطلوب' }, { status: 400 });
    }

    await prisma.tenantKnowledge.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge delete error:', error);
    return NextResponse.json({ error: 'فشل في حذف المعرفة' }, { status: 500 });
  }
}
