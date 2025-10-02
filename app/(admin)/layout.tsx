import { logtoConfig } from '@/app/logto';
import { AdminLayoutClient } from '@/components/admin-layout-client';
import { getLogtoContext } from '@logto/next/server-actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);

  return (
    <AdminLayoutClient
      isAuthenticated={isAuthenticated}
      claims={claims ?? null}
    >
      {children}
    </AdminLayoutClient>
  );
}