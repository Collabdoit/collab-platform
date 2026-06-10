// ─── Tool System Types ────────────────────────────────────

export interface ToolContext {
  tenantId: string;
  agentId: string;
  agentName: string;
  taskId?: string;
}

export interface ToolResult {
  success: boolean;
  output: string;
  metadata?: Record<string, unknown>;
  requiresApproval?: boolean;  // If true, tool won't execute until user approves
  previewData?: unknown;       // Data to show user before approval
}

export interface ToolParams {
  [key: string]: unknown;
}

export type ToolHandler = (
  params: ToolParams,
  context: ToolContext,
) => Promise<ToolResult>;

export interface ToolDefinition {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  requiresApproval: boolean;   // Whether this tool needs human approval
  paramSchema: Record<string, { type: string; required: boolean; descriptionAr: string }>;
  handler: ToolHandler;
}

// Tool call parsed from AI response
export interface ToolCall {
  toolName: string;
  params: ToolParams;
  id: string;  // unique ID for tracking
}

// Tool execution status
export type ToolStatus = 'PENDING' | 'APPROVED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'REJECTED';
