import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST /api/register — Create a new user account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create tenant (organization)
    const slug = (companyName || name).toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u0600-\u06FF-]/g, '')
      .substring(0, 30) + '-' + Date.now().toString(36);

    const tenant = await prisma.tenant.create({
      data: {
        name: companyName || name,
        slug,
        industry: null,
      },
    });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'OWNER',
        tenantId: tenant.id,
      },
    });

    // Create default subscription
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        tier: 'FREE',
        monthlyBudget: 0,
        tokensBudget: 10000,
        tokensUsed: 0,
      },
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الحساب' }, { status: 500 });
  }
}
