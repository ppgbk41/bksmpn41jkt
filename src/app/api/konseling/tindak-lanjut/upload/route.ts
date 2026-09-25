import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada berkas foto yang diunggah.' }, { status: 400 });
    }

    // Format check: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: 'Format berkas tidak didukung. Silakan gunakan foto berformat JPG, JPEG, PNG, atau WEBP.'
      }, { status: 400 });
    }

    // Size check: Max 1 MB
    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: 'Ukuran foto terlalu besar. Maksimal 1 MB.'
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tindak-lanjut');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/uploads/tindak-lanjut/${filename}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Error uploading tindak lanjut documentation:', error);
    return NextResponse.json({
      error: 'Gagal mengunggah foto: ' + (error?.message || 'Terjadi kesalahan server.')
    }, { status: 500 });
  }
}
