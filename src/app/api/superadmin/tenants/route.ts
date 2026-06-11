import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSuperAdminContext } from '@/lib/auth';

const PAGE_SIZE = 20;

// GET /api/superadmin/tenants — List/search all tenants
export async function GET(request: NextRequest) {
  try {
    const admin = await getSuperAdminContext();
    if (!admin) return NextResponse.json({ error: 'غير مصرّح' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    // Build where clause
    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { members: { some: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }
    if (tier) {
      where.subscription = { tier };
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sort === 'name') orderBy = { name: 'asc' };

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true, name: true, slug: true, industry: true, createdAt: true,
          subscription: { select: { tier: true, monthlyBudget: true, tokensUsed: true, tokensBudget: true } },
          _count: { select: { members: true, hiredAgents: true, tasks: true, knowledge: true } },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      tenants,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    });
  } catch (error) {
    console.error('Super admin tenants error:', error);
    return NextResponse.json({ error: 'فشل في جلب المنظمات' }, { status: 500 });
  }
}
