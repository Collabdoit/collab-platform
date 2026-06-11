import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import prisma from '@/lib/prisma';
import { getAuthContext } from '@/lib/auth';
import { trainFromDocument, isTextExtractable } from '@/lib/document-trainer';

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'csv',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
  'application/vnd.ms-powerpoint': 'doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'doc',
  'text/plain': 'doc',
  'application/json': 'doc',
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    if (!auth?.tenantId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const source = (formData.get('source') as string) || 'user_upload';
    const agentId = formData.get('agentId') as string | null;
    const agentName = formData.get('agentName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم إرسال ملف' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز 10 ميجابايت' }, { status: 400 });
    }

    const fileType = ALLOWED_TYPES[file.type];
    if (!fileType) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    // Read the file once; reuse the buffer for both blob upload and training.
    const buffer = await file.arrayBuffer();

    // Upload to Vercel Blob
    const blob = await put(`documents/${auth.tenantId}/${Date.now()}-${file.name}`, buffer, {
      access: 'public',
      contentType: file.type,
    });

    // Save to database
    const document = await prisma.document.create({
      data: {
        tenantId: auth.tenantId,
        name: file.name,
        type: fileType,
        mimeType: file.type,
        size: file.size,
        url: blob.url,
        source,
        agentId: agentId || undefined,
        agentName: agentName || undefined,
      },
    });

    // Auto-train: distill text-readable documents into tenant knowledge.
    // Only for user uploads (not agent-generated files) and only text formats.
    let knowledgeCreated = 0;
    if (source === 'user_upload' && isTextExtractable(file.type)) {
      knowledgeCreated = await trainFromDocument({
        tenantId: auth.tenantId,
        filename: file.name,
        mimeType: file.type,
        buffer,
      });
    }

    return NextResponse.json(
      {
        document,
        training: {
          extracted: knowledgeCreated > 0,
          knowledgeCreated,
          // Tell the client when a format was uploaded but can't be auto-read yet.
          supported: isTextExtractable(file.type),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'فشل في رفع الملف' }, { status: 500 });
  }
}
