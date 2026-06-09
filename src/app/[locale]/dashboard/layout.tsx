import OfficeLayout from '@/components/office/OfficeLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OfficeLayout>{children}</OfficeLayout>;
}
