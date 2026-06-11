import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSuperAdminContext } from '@/lib/auth';

const PAGE_SIZE = 20;

// GET /api/superadmin/users — List/search all users
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdminContext();
    if (!admin) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const filter = searchParams.get('filter') || ''; // 'no-tenant' | ''

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (filter === 'no-tenant') {
      where.tenantId = null;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true, name: true, email: true, role: true,
          isSuperAdmin: true, createdAt: true,
          tenant: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error('Super admin users error:', error);
    return NextResponse.json({ error: 'فشل في جلب المستخدمين' }, { status: 500 });
  }
}
