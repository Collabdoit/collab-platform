import prisma from './prisma';

// ─── Get or Create Tenant for User ────────────────────────

export async function getOrCreateTenant(userId: string): Promise<string> {
  // Check if user already has a tenant
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true, name: true, email: true, companyName: true },
  });

  if (user?.tenantId) return user.tenantId;

  // Auto-create a tenant for this user
  const tenantName = user?.companyName || user?.name || user?.email?.split('@')[0] || 'شركتي';
  const slug = generateSlug(tenantName);

  const tenant = await prisma.tenant.create({
    data: {
      name: tenantName,
      slug,
    },
  });

  // Link user to tenant as OWNER
  await prisma.user.update({
    where: { id: userId },
    data: { tenantId: tenant.id, role: 'OWNER' },
  });

  return tenant.id;
}

// ─── Resolve Tenant ID from User ID ──────────────────────

export async function resolveTenantId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true },
  });
  return user?.tenantId || null;
}

// ─── Verify User Belongs to Tenant ────────────────────────

export async function verifyTenantAccess(
  userId: string,
  tenantId: string,
): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
  });
  return !!user;
}

// ─── Get Tenant with Members ──────────────────────────────

export async function getTenantWithMembers(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
        },
      },
      subscription: true,
      _count: {
        select: {
          hiredAgents: true,
          tasks: true,
          knowledge: true,
        },
      },
    },
  });
}

// ─── Helpers ──────────────────────────────────────────────

function generateSlug(name: string): string {
  // Convert Arabic/English to a URL-safe slug
  const base = name
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
