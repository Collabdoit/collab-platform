import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getOrCreateTenant } from './tenant';

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
