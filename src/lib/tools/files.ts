// ─── File Generation Tools ────────────────────────────────
// Generate CSV, JSON, and HTML report files.

import type { ToolHandler, ToolResult } from './types';

export const generateCsvTool: ToolHandler = async (params): Promise<ToolResult> => {
  const { headers, rows, filename } = params as {
    headers: string[];
    rows: (string | number)[][];
    filename?: string;
  };

  if (!headers || !rows) {
    return { success: false, output: 'العناوين والصفوف مطلوبة' };
  }

  try {
    // Escape CSV values
    const escapeCsv = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => row.map(escapeCsv).join(',')),
    ];
    const csvContent = csvLines.join('\n');

    return {
      success: true,
      output: `✅ تم إنشاء ملف CSV — ${rows.length} صف، ${headers.length} عمود\n\n📄 معاينة:\n\`\`\`csv\n${csvLines.slice(0, 6).join('\n')}${rows.length > 5 ? '\n...' : ''}\n\`\`\``,
      metadata: {
        filename: filename || 'report.csv',
        content: csvContent,
        mimeType: 'text/csv',
        rowCount: rows.length,
        columnCount: headers.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      output: `❌ فشل في إنشاء CSV: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
};

export const generateJsonTool: ToolHandler = async (params): Promise<ToolResult> => {
  const { data, filename } = params as {
    data: unknown;
    filename?: string;
  };

  if (!data) {
    return { success: false, output: 'البيانات مطلوبة' };
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const preview = jsonContent.length > 500 ? jsonContent.substring(0, 500) + '\n...' : jsonContent;

    return {
      success: true,
      output: `✅ تم إنشاء ملف JSON\n\n📄 معاينة:\n\`\`\`json\n${preview}\n\`\`\``,
      metadata: {
        filename: filename || 'data.json',
        content: jsonContent,
        mimeType: 'application/json',
        size: jsonContent.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      output: `❌ فشل في إنشاء JSON: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
};

export const generateHtmlReportTool: ToolHandler = async (params, context): Promise<ToolResult> => {
  const { title, sections, includeCharts } = params as {
    title: string;
    sections: { heading: string; content: string }[];
    includeCharts?: boolean;
  };

  if (!title || !sections) {
    return { success: false, output: 'العنوان والأقسام مطلوبة' };
  }

  try {
    const sectionsHtml = sections.map(s => `
      <section style="margin-bottom: 2rem;">
        <h2 style="color: #6366F1; border-bottom: 2px solid #6366F1; padding-bottom: 0.5rem;">${s.heading}</h2>
        <div style="line-height: 1.8;">${s.content.replace(/\n/g, '<br>')}</div>
      </section>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, sans-serif;
      background: #0F1117; color: #E2E8F0;
      padding: 2rem; max-width: 900px; margin: 0 auto;
    }
    h1 { font-size: 1.8rem; color: #F1F5F9; margin-bottom: 0.5rem; }
    .meta { color: #64748B; margin-bottom: 2rem; font-size: 0.9rem; }
    h2 { font-size: 1.3rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #1E293B; color: #475569; font-size: 0.8rem; text-align: center; }
  </style>
</head>
<body>
  <h1>📊 ${title}</h1>
  <div class="meta">أعدّه: ${context.agentName} | التاريخ: ${new Date().toLocaleDateString('ar-SA')}</div>
  ${sectionsHtml}
  <div class="footer">تم إنشاء هذا التقرير بواسطة ${context.agentName} — منصة كولاب</div>
</body>
</html>`;

    return {
      success: true,
      output: `✅ تم إنشاء تقرير HTML — "${title}" (${sections.length} أقسام)`,
      metadata: {
        filename: `${title.replace(/\s+/g, '-')}.html`,
        content: htmlContent,
        mimeType: 'text/html',
        sectionCount: sections.length,
      },
    };
  } catch (err) {
    return {
      success: false,
      output: `❌ فشل في إنشاء التقرير: ${err instanceof Error ? err.message : 'Unknown'}`,
    };
  }
};
