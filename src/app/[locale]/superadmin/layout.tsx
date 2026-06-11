import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side guard: only super admins can access this layout
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const user = session.user as { id?: string };
  if (!user.id) redirect('/login');

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isSuperAdmin: true },
  });

  if (!dbUser?.isSuperAdmin) redirect('/dashboard');

  return <>{children}</>;
}
