import DocumentsClient from './DocumentsClient';

export const metadata = {
  title: 'المستندات | المكتب',
  description: 'إدارة مستنداتك وملفاتك',
};

export default function DocumentsPage() {
  return <DocumentsClient />;
}
