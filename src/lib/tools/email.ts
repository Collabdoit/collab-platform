// ─── Email Tool (Resend) ──────────────────────────────────
// Sends real emails via Resend. Always requires human approval.
// FROM address is dynamic per tenant: {slug}@collablabsco.com

import type { ToolHandler, ToolResult } from './types';
import prisma from '../prisma';

const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'collablabsco.com';

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

  // Get tenant slug for dynamic FROM email
  let fromEmail = `team@${EMAIL_DOMAIN}`;
  let tenantName = 'كولاب';
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: { slug: true, name: true },
    });
    if (tenant) {
      fromEmail = `${tenant.slug}@${EMAIL_DOMAIN}`;
      tenantName = tenant.name;
    }
  } catch {
    // fallback to default
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: `${context.agentName} - ${tenantName} <${fromEmail}>`,
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
      output: `✅ تم إرسال البريد بنجاح إلى ${to} من ${fromEmail}`,
      metadata: { emailId: data.id, to, subject, from: fromEmail },
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
