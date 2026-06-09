import WorkspaceClient from './WorkspaceClient';

export const metadata = { title: 'المكتب | مكتب الموظف' };

export default async function AgentWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WorkspaceClient agentId={id} />;
}
