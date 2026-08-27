import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat mengimpor data guru/pengguna' }, { status: 403 });
    }

    const body = await request.json();
    const { teachers = [] } = body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return NextResponse.json({ error: 'Data guru tidak boleh kosong' }, { status: 400 });
    }

    // Ambil master kelas
    const classes = await prisma.class.findMany();
    const classMap = new Map(classes.map(c => [c.name.toUpperCase().trim(), c]));

    let createdCount = 0;
    let updatedCount = 0;
    let errorRows: any[] = [];

    const defaultBkHash = await bcrypt.hash('bk123', 10);
    const defaultWaliHash = await bcrypt.hash('wali123', 10);
    const defaultAdminHash = await bcrypt.hash('admin123', 10);

    for (let i = 0; i < teachers.length; i++) {
      const row = teachers[i];
      const rowNum = i + 1;

      const name = String(row.name || row.Nama || row['Nama Lengkap'] || '').trim();
      const nip = String(row.nip || row.NIP || '').trim();
      const rawRole = String(row.role || row.Role || row.Peran || 'WALI_KELAS').trim().toUpperCase();
      const rawClass = String(row.className || row.Kelas || row['Wali Kelas'] || '').trim().toUpperCase();
      const email = String(row.email || row.Email || '').trim() || null;
      const phone = String(row.phone || row['No Telepon'] || row['No HP'] || '').trim() || null;
      
      let role = 'WALI_KELAS';
      if (rawRole.includes('BK') || rawRole.includes('BIMBINGAN')) role = 'GURU_BK';
      else if (rawRole.includes('ADMIN')) role = 'ADMIN';

      if (!name) {
        errorRows.push({ row: rowNum, name: 'Tanpa Nama', error: 'Nama guru wajib diisi' });
        continue;
      }

      // Tentukan username
      let username = String(row.username || row.Username || '').trim().toLowerCase();
      if (!username) {
        if (role === 'WALI_KELAS' && rawClass) {
          username = `wali_${rawClass.toLowerCase()}`;
        } else if (nip) {
          username = nip;
        } else {
          username = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15);
        }
      }

      // Tentukan password hash
      let passwordHash = defaultWaliHash;
      if (role === 'GURU_BK') passwordHash = defaultBkHash;
      else if (role === 'ADMIN') passwordHash = defaultAdminHash;

      if (row.password || row.Password) {
        passwordHash = await bcrypt.hash(String(row.password || row.Password), 10);
      }

      let activeClassId: string | null = null;
      if (role === 'WALI_KELAS' && rawClass) {
        let matchedClass = classMap.get(rawClass);
        if (matchedClass) {
          activeClassId = matchedClass.id;
          // Update data wali kelas di tabel Class
          await prisma.class.update({
            where: { id: matchedClass.id },
            data: {
              teacherName: name,
              teacherNip: nip || matchedClass.teacherNip
            }
          });
        }
      }

      try {
        const existing = await prisma.user.findUnique({ where: { username } });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              name,
              nipNis: nip || existing.nipNis,
              email: email || existing.email,
              phone: phone || existing.phone,
              role,
              activeClassId: activeClassId || existing.activeClassId
            }
          });
          updatedCount++;
        } else {
          await prisma.user.create({
            data: {
              username,
              email,
              passwordHash,
              role,
              name,
              nipNis: nip || null,
              phone,
              activeClassId,
              mustChangePassword: false
            }
          });
          createdCount++;
        }
      } catch (err: any) {
        console.error(`Error saving teacher row ${rowNum}:`, err);
        errorRows.push({ row: rowNum, name, error: err.message });
      }
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'IMPORT_TEACHERS',
        module: 'Manajemen Pengguna',
        details: `Mengimpor data Guru & Wali Kelas via Excel/CSV: ${createdCount} dibuat baru, ${updatedCount} diperbarui, ${errorRows.length} error.`
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: teachers.length,
        createdCount,
        updatedCount,
        errorCount: errorRows.length,
        errorRows
      }
    });
  } catch (error: any) {
    console.error('Error importing teachers:', error);
    return NextResponse.json({ error: 'Gagal memproses impor guru: ' + error.message }, { status: 500 });
  }
}
