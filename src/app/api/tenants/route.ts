import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getOrCreateTenant, getTenantWithMembers } from '@/lib/tenant';

// GET /api/tenants?userId=xxx — Get user's tenant
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId مطلوب' }, { status: 400 });
    }

    // Auto-create tenant if not exists
    const tenantId = await getOrCreateTenant(userId);
    const tenant = await getTenantWithMembers(tenantId);

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Tenant fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات المنظمة' }, { status: 500 });
  }
}

// PUT /api/tenants — Update tenant info
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, name, industry, brandGuideAr, brandGuideEn } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId مطلوب' }, { status: 400 });
    }

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(name && { name }),
        ...(industry !== undefined && { industry }),
        ...(brandGuideAr !== undefined && { brandGuideAr }),
        ...(brandGuideEn !== undefined && { brandGuideEn }),
      },
    });

    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Tenant update error:', error);
    return NextResponse.json({ error: 'فشل في تحديث المنظمة' }, { status: 500 });
  }
}

// POST /api/tenants/invite — Invite member to tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, email, role = 'MEMBER' } = body;

    if (!tenantId || !email) {
      return NextResponse.json({ error: 'tenantId و email مطلوبين' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير مسجل' }, { status: 404 });
    }

    if (user.tenantId) {
      return NextResponse.json({ error: 'المستخدم ينتمي لمنظمة أخرى' }, { status: 409 });
    }

    // Add to tenant
    await prisma.user.update({
      where: { id: user.id },
      data: { tenantId, role },
    });

    return NextResponse.json({ success: true, member: { id: user.id, email, role } });
  } catch (error) {
    console.error('Tenant invite error:', error);
    return NextResponse.json({ error: 'فشل في دعوة العضو' }, { status: 500 });
  }
}
