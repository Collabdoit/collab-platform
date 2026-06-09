import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';
import { getTenantWithMembers } from '@/lib/tenant';

// GET /api/tenants — Get user's tenant
export async function GET() {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const tenant = await getTenantWithMembers(auth.tenantId);
    return NextResponse.json({ tenant });
  } catch (error) {
    console.error('Tenant fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب بيانات المنظمة' }, { status: 500 });
  }
}

// PUT /api/tenants — Update tenant info
export async function PUT(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { name, industry, brandGuideAr, brandGuideEn } = body;

    const tenant = await prisma.tenant.update({
      where: { id: auth.tenantId },
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

// POST /api/tenants — Invite member
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const body = await request.json();
    const { email, role = 'MEMBER' } = body;

    if (!email) return NextResponse.json({ error: 'email مطلوب' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'المستخدم غير مسجل' }, { status: 404 });
    if (user.tenantId) return NextResponse.json({ error: 'المستخدم ينتمي لمنظمة أخرى' }, { status: 409 });

    await prisma.user.update({
      where: { id: user.id },
      data: { tenantId: auth.tenantId, role },
    });

    return NextResponse.json({ success: true, member: { id: user.id, email, role } });
  } catch (error) {
    console.error('Tenant invite error:', error);
    return NextResponse.json({ error: 'فشل في دعوة العضو' }, { status: 500 });
  }
}
