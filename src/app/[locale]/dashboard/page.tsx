import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'المكتب | لوحة التحكم',
  description: 'لوحة تحكم مكتبك الافتراضي — إدارة الموظفين والمهام والتسليمات',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
