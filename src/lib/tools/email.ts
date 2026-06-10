// ─── Email Tool (Resend) ──────────────────────────────────
// Sends real emails via Resend. Always requires human approval.

import type { ToolHandler, ToolResult } from './types';

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'team@collab-platform-iota.vercel.app';

export const sendEmailTool: ToolHandler = async (params, context): Promise<ToolResult> => {
  const { to, subject, body, html } = params as {
    to: string;
    subject: string;
    body?: string;
    html?: string;
  };

  if (!to || !subject) {
    return { success: false, output: 'البريد الإلكتروني والعنوان مطلوبان' };
  }

  if (!RESEND_KEY) {
    return {
      success: false,
      output: 'مفتاح Resend غير مُعدّ. يرجى إضافة RESEND_API_KEY في الإعدادات.',
    };
  }

  // This tool always needs approval — return preview first
  // The registry will check requiresApproval and create a PENDING execution
  // When approved, this handler runs again with the same params

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: `${context.agentName} - كولاب <${FROM_EMAIL}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        ...(html ? { html } : { text: body || '' }),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, output: `فشل إرسال البريد: ${err}` };
    }

    const data = await res.json();
    return {
      success: true,
      output: `✅ تم إرسال البريد بنجاح إلى ${to}`,
      metadata: { emailId: data.id, to, subject },
    };
  } catch (err) {
    return {
      success: false,
      output: `خطأ في إرسال البريد: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
};

// Generate preview data for approval UI
export function generateEmailPreview(params: Record<string, unknown>) {
  return {
    to: params.to,
    subject: params.subject,
    body: params.body || params.html || '',
    isHtml: !!params.html,
  };
}
