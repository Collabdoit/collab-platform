import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';

// POST /api/documents/save-text — Save agent-generated text content as an HTML document
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth?.tenantId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { content, filename, agentId, agentName } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    const safeName = (filename || 'مستند').replace(/[^a-zA-Z0-9\u0600-\u06FF\s_.-]/g, '');
    const htmlFilename = `${safeName}.html`;

    // Build a styled RTL HTML document from the text content
    const htmlContent = buildHtmlDocument(content, safeName, agentName || 'موظف');

    const fileBlob = new Blob([htmlContent], { type: 'text/html' });

    // Upload to Vercel Blob
    const blob = await put(
      `documents/${auth.tenantId}/${Date.now()}-${htmlFilename}`,
      fileBlob,
      { access: 'public', contentType: 'text/html' },
    );

    // Save to Document table
    const document = await prisma.document.create({
      data: {
        tenantId: auth.tenantId,
        name: htmlFilename,
        type: 'doc',
        mimeType: 'text/html',
        size: fileBlob.size,
        url: blob.url,
        source: 'agent_generated',
        agentId: agentId || undefined,
        agentName: agentName || undefined,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Save-text error:', error);
    return NextResponse.json({ error: 'فشل في حفظ المستند' }, { status: 500 });
  }
}

// ─── HTML Builder ─────────────────────────────────────────

function buildHtmlDocument(content: string, title: string, agentName: string): string {
  // Convert markdown-like formatting to HTML
  const htmlBody = content
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Headers: ## text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Lists: - item
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap consecutive <li> elements in <ul>
  const wrappedBody = htmlBody
    .replace(/(<li>.*?<\/li>(?:\s*<br>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
    });

  const date = new Date().toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: #0F1117;
      color: #E2E8F0;
      padding: 2.5rem;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.9;
    }
    .header {
      border-bottom: 2px solid #6366F1;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .header h1 {
      font-size: 1.8rem;
      color: #F1F5F9;
      margin-bottom: 0.5rem;
    }
    .meta {
      color: #64748B;
      font-size: 0.85rem;
      display: flex;
      gap: 1rem;
    }
    p { margin-bottom: 1rem; }
    h2 {
      font-size: 1.3rem;
      color: #6366F1;
      margin: 1.5rem 0 0.75rem;
      border-bottom: 1px solid rgba(99,102,241,0.3);
      padding-bottom: 0.4rem;
    }
    h3 {
      font-size: 1.1rem;
      color: #818CF8;
      margin: 1.2rem 0 0.5rem;
    }
    ul {
      padding-right: 1.5rem;
      margin-bottom: 1rem;
    }
    li {
      margin-bottom: 0.4rem;
      color: #CBD5E1;
    }
    strong { color: #F1F5F9; }
    .footer {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #1E293B;
      color: #475569;
      font-size: 0.8rem;
      text-align: center;
    }
    @media print {
      body { background: #fff; color: #1a1a1a; }
      .header h1 { color: #1a1a1a; }
      h2 { color: #4F46E5; }
      h3 { color: #6366F1; }
      li { color: #374151; }
      strong { color: #1a1a1a; }
      .meta { color: #6B7280; }
      .footer { color: #9CA3AF; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 ${title}</h1>
    <div class="meta">
      <span>أعدّه: ${agentName}</span>
      <span>•</span>
      <span>التاريخ: ${date}</span>
    </div>
  </div>
  <div class="content">
    <p>${wrappedBody}</p>
  </div>
  <div class="footer">
    تم إنشاء هذا المستند بواسطة ${agentName} — منصة كولاب
  </div>
</body>
</html>`;
}
