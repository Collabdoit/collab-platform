// ─── Web Tools (Scraping & Search) ────────────────────────
// Fetch and parse web pages for competitive analysis, SEO audits, etc.

import type { ToolHandler, ToolResult } from './types';

const MAX_CONTENT_LENGTH = 8000;
const FETCH_TIMEOUT = 15000;
const MAX_REDIRECTS = 3;

// ─── SSRF Guard ───────────────────────────────────────────
// Block requests to loopback, link-local, and private network ranges so the
// agent can't be steered into fetching cloud metadata or internal services.
function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ''); // strip IPv6 brackets

  // Hostname-based blocks
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) {
    return true;
  }

  // IPv6 loopback / link-local / unique-local
  if (h === '::1' || h.startsWith('fe80:') || h.startsWith('fc') || h.startsWith('fd')) {
    return true;
  }

  // IPv4 literal ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (a === 127) return true;                          // loopback
    if (a === 10) return true;                           // private
    if (a === 172 && b >= 16 && b <= 31) return true;    // private
    if (a === 192 && b === 168) return true;             // private
    if (a === 169 && b === 254) return true;             // link-local (cloud metadata)
    if (a === 0) return true;                            // "this" network
  }
  return false;
}

function validateUrl(raw: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: `الرابط غير صالح: ${raw}` };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'يُسمح فقط بروابط http و https' };
  }
  if (isBlockedHost(parsed.hostname)) {
    return { ok: false, reason: 'الوصول لهذا العنوان غير مسموح' };
  }
  return { ok: true, url: parsed };
}

export const scrapeUrlTool: ToolHandler = async (params): Promise<ToolResult> => {
  const { url } = params as { url: string };

  if (!url) {
    return { success: false, output: 'رابط URL مطلوب' };
  }

  const check = validateUrl(url);
  if (!check.ok) {
    return { success: false, output: check.reason };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    // Follow redirects manually so each hop is re-validated against the SSRF guard.
    let currentUrl = check.url.toString();
    let res: Response;
    for (let i = 0; ; i++) {
      res = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'ColabBot/1.0 (Marketing Analysis)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
        if (i >= MAX_REDIRECTS) {
          clearTimeout(timeout);
          return { success: false, output: 'تجاوز عدد التحويلات المسموح' };
        }
        const next = new URL(res.headers.get('location')!, currentUrl);
        const redirectCheck = validateUrl(next.toString());
        if (!redirectCheck.ok) {
          clearTimeout(timeout);
          return { success: false, output: redirectCheck.reason };
        }
        currentUrl = next.toString();
        continue;
      }
      break;
    }

    clearTimeout(timeout);

    if (!res.ok) {
      return { success: false, output: `فشل في الوصول للموقع: HTTP ${res.status}` };
    }

    const html = await res.text();

    // Extract useful data from HTML
    const title = extractTag(html, 'title');
    const metaDescription = extractMeta(html, 'description');
    const metaKeywords = extractMeta(html, 'keywords');
    const ogTitle = extractOg(html, 'og:title');
    const ogDescription = extractOg(html, 'og:description');
    const ogImage = extractOg(html, 'og:image');
    const h1s = extractAllTags(html, 'h1');
    const h2s = extractAllTags(html, 'h2');
    const links = countLinks(html);
    const images = countImages(html);
    const wordCount = estimateWordCount(html);

    // Extract visible text content (strip HTML)
    const textContent = stripHtml(html).substring(0, MAX_CONTENT_LENGTH);

    const report = [
      `🌐 تحليل الموقع: ${url}`,
      '',
      '📋 البيانات الوصفية:',
      `  العنوان: ${title || '❌ غير موجود'}`,
      `  الوصف: ${metaDescription || '❌ غير موجود'}`,
      `  الكلمات المفتاحية: ${metaKeywords || '❌ غير محدد'}`,
      '',
      '📊 Open Graph:',
      `  OG Title: ${ogTitle || '❌ غير موجود'}`,
      `  OG Description: ${ogDescription || '❌ غير موجود'}`,
      `  OG Image: ${ogImage || '❌ غير موجود'}`,
      '',
      '📑 هيكل الصفحة:',
      `  عناوين H1 (${h1s.length}): ${h1s.join(' | ') || 'لا يوجد'}`,
      `  عناوين H2 (${h2s.length}): ${h2s.slice(0, 5).join(' | ') || 'لا يوجد'}`,
      `  عدد الروابط: ${links.internal} داخلي, ${links.external} خارجي`,
      `  عدد الصور: ${images}`,
      `  عدد الكلمات التقديري: ${wordCount}`,
      '',
      '📄 محتوى الصفحة (أول 2000 حرف):',
      textContent.substring(0, 2000),
    ].join('\n');

    return {
      success: true,
      output: report,
      metadata: {
        url,
        title,
        metaDescription,
        h1Count: h1s.length,
        h2Count: h2s.length,
        wordCount,
        linkCount: links.internal + links.external,
        imageCount: images,
      },
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, output: `⏱️ انتهت المهلة — الموقع بطيء جداً (${FETCH_TIMEOUT / 1000} ثوانٍ)` };
    }
    return {
      success: false,
      output: `❌ فشل في تحليل الموقع: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
};

// ─── HTML Parsing Helpers ─────────────────────────────────

function extractTag(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return match?.[1]?.trim() || '';
}

function extractMeta(html: string, name: string): string {
  const match = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function extractOg(html: string, property: string): string {
  const match = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'));
  return match?.[1]?.trim() || '';
}

function extractAllTags(html: string, tag: string): string[] {
  const matches = html.matchAll(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'gi'));
  return [...matches].map(m => m[1].trim()).filter(Boolean);
}

function countLinks(html: string): { internal: number; external: number } {
  const links = html.matchAll(/<a[^>]*href=["']([^"']*)["']/gi);
  let internal = 0, external = 0;
  for (const m of links) {
    if (m[1].startsWith('http')) external++;
    else internal++;
  }
  return { internal, external };
}

function countImages(html: string): number {
  return (html.match(/<img\s/gi) || []).length;
}

function estimateWordCount(html: string): number {
  const text = stripHtml(html);
  return text.split(/\s+/).filter(Boolean).length;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
