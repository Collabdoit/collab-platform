import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrCreateTenant } from './tenant';
import prisma from './prisma';

export interface AuthContext {
  userId: string;
  tenantId: string;
  email: string;
  name: string | null;
}

/**
 * Get authenticated user + tenant from session.
 * Returns null if not authenticated.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) return null;

  const user = session.user as { id?: string; email: string; name?: string | null };

  if (!user.id) return null;

  const tenantId = await getOrCreateTenant(user.id);

  return {
    userId: user.id,
    tenantId,
    email: user.email,
    name: user.name || null,
  };
}

/**
 * Verify the current user is a super admin.
 * Returns { userId, email } or null.
 */
export async function getSuperAdminContext(): Promise<{ userId: string; email: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = session.user as { id?: string; email: string };
  if (!user.id) return null;

  // Double-check against DB (don't trust JWT alone for admin access)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isSuperAdmin: true },
  });

  if (!dbUser?.isSuperAdmin) return null;

  return { userId: user.id, email: user.email };
}
