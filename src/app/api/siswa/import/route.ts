import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin dan Guru BK yang dapat mengimpor data' }, { status: 403 });
    }

    const body = await request.json();
    const { students = [], defaultPassword = 'murid123' } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Data siswa tidak boleh kosong' }, { status: 400 });
    }

    // Ambil semua master kelas yang ada
    const existingClasses = await prisma.class.findMany();
    const classMap = new Map(existingClasses.map(c => [c.name.toUpperCase().trim(), c]));

    // Hash default password sekali untuk efisiensi
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    let createdCount = 0;
    let updatedCount = 0;
    let errorRows: any[] = [];

    // Ambil tahun ajaran aktif
    const activeAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } });
    const currentAcademicYear = activeAY?.year || '2025/2026';

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const rowNum = i + 1;

      const nis = String(row.nis || row.NIS || '').trim();
      const nisn = String(row.nisn || row.NISN || '').trim();
      const name = String(row.name || row.Nama || row['Nama Lengkap'] || '').trim();
      const rawGender = String(row.gender || row['Jenis Kelamin'] || row.JK || 'L').trim().toUpperCase();
      const gender = (rawGender.startsWith('P') || rawGender === 'PEREMPUAN') ? 'P' : 'L';
      const rawClassName = String(row.className || row.Kelas || row.kelas || '7A').toUpperCase().trim();

      if (!nis || !nisn || !name || !rawClassName) {
        errorRows.push({
          row: rowNum,
          name: name || 'Tanpa Nama',
          error: 'NIS, NISN, Nama, atau Kelas tidak lengkap'
        });
        continue;
      }

      // Pastikan kelas tujuan ada, jika belum ada buat otomatis
      let targetClass = classMap.get(rawClassName);
      if (!targetClass) {
        const level = parseInt(rawClassName.charAt(0)) || 7;
        const section = rawClassName.slice(1) || 'A';
        targetClass = await prisma.class.create({
          data: {
            name: rawClassName,
            level: [7, 8, 9].includes(level) ? level : 7,
            section: section,
            academicYear: currentAcademicYear
          }
        });
        classMap.set(rawClassName, targetClass);
      }

      const birthPlace = String(row.birthPlace || row['Tempat Lahir'] || 'Jakarta').trim();
      const birthDate = String(row.birthDate || row['Tanggal Lahir'] || '2012-01-01').trim();
      const religion = String(row.religion || row.Agama || 'Islam').trim();
      const address = String(row.address || row.Alamat || '').trim();
      const phone = String(row.phone || row['No Telepon'] || row['No HP'] || '').trim();
      const email = String(row.email || row.Email || '').trim() || null;
      const fatherName = String(row.fatherName || row['Nama Ayah'] || '').trim();
      const motherName = String(row.motherName || row['Nama Ibu'] || '').trim();
      const guardianName = String(row.guardianName || row['Nama Wali'] || '').trim();
      const parentPhone = String(row.parentPhone || row['No HP Orang Tua'] || row['No Telepon Orang Tua'] || '').trim();
      const parentJob = String(row.parentJob || row['Pekerjaan Orang Tua'] || '').trim();
      const status = String(row.status || row.Status || 'Aktif').trim();

      try {
        // Cek apakah siswa sudah ada berdasarkan NIS atau NISN
        const existingStudent = await prisma.student.findFirst({
          where: {
            OR: [{ nis }, { nisn }]
          }
        });

        let savedStudent;

        if (existingStudent) {
          savedStudent = await prisma.student.update({
            where: { id: existingStudent.id },
            data: {
              name,
              gender,
              currentClassId: targetClass.id,
              birthPlace,
              birthDate,
              religion,
              address,
              phone,
              email,
              fatherName,
              motherName,
              guardianName,
              parentPhone,
              parentJob,
              status
            }
          });
          updatedCount++;
        } else {
          savedStudent = await prisma.student.create({
            data: {
              nis,
              nisn,
              name,
              gender,
              currentClassId: targetClass.id,
              birthPlace,
              birthDate,
              religion,
              address,
              phone,
              email,
              fatherName,
              motherName,
              guardianName,
              parentPhone,
              parentJob,
              status
            }
          });
          createdCount++;
        }

        // Buat atau perbarui akun login Siswa
        const existingUser = await prisma.user.findUnique({
          where: { username: nis }
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              username: nis,
              email: email || `${nis}@siswa.smp41jkt.sch.id`,
              passwordHash,
              role: 'MURID',
              name,
              nipNis: nis,
              studentId: savedStudent.id,
              mustChangePassword: false
            }
          });
        } else {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              studentId: savedStudent.id,
              nipNis: nis
            }
          });
        }
      } catch (err: any) {
        console.error(`Error saving row ${rowNum}:`, err);
        errorRows.push({
          row: rowNum,
          name,
          error: err.message || 'Gagal menyimpan baris'
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'IMPORT_STUDENTS',
        module: 'Peserta Didik',
        details: `Mengimpor data siswa via Excel/CSV: ${createdCount} dibuat baru, ${updatedCount} diperbarui, ${errorRows.length} error.`
      }
    });

    return NextResponse.json({
      success: true,
      summary: {
        total: students.length,
        createdCount,
        updatedCount,
        errorCount: errorRows.length,
        errorRows
      }
    });
  } catch (error: any) {
    console.error('Error importing students:', error);
    return NextResponse.json({ error: 'Gagal memproses impor data siswa: ' + error.message }, { status: 500 });
  }
}
