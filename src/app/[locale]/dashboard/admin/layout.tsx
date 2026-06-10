// Admin layout — passthrough, the main office layout handles sidebar/topbar
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
