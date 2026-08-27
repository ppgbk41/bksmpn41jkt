import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateBkCode(): string {
  // Generate random 3 digits between 100 and 999
  const randomDigits = Math.floor(100 + Math.random() * 900);
  return `bk${randomDigits}`;
}

// GET: Ambil daftar akun murid saat ini
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentUsers = await prisma.user.findMany({
      where: { role: 'MURID' },
      select: {
        id: true,
        username: true,
        name: true,
        nipNis: true,
        studentId: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ accounts: studentUsers });
  } catch (error: any) {
    console.error('Error fetching student accounts:', error);
    return NextResponse.json({ error: 'Gagal mengambil data akun murid' }, { status: 500 });
  }
}

// POST: Generate Massal Username & Password Murid (Format: bk + 3 angka random)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin dan Guru BK yang dapat mengelola akun murid' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { classId, level } = body;

    let studentWhere: any = { status: 'Aktif' };
    if (classId && classId !== 'ALL') {
      studentWhere.currentClassId = classId;
    } else if (level && level !== 'ALL') {
      studentWhere.currentClass = { level: parseInt(level) };
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        currentClass: {
          select: { name: true, level: true }
        }
      },
      orderBy: [
        { currentClass: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    if (students.length === 0) {
      return NextResponse.json({ error: 'Tidak ditemukan data siswa aktif untuk dibuatkan akun' }, { status: 400 });
    }

    // Ambil semua username yang sudah terpakai
    const existingUsers = await prisma.user.findMany({
      select: { id: true, username: true, studentId: true, nipNis: true }
    });

    const usedUsernames = new Set(existingUsers.map(u => u.username.toLowerCase()));
    const userByStudentId = new Map(existingUsers.filter(u => u.studentId).map(u => [u.studentId, u]));
    const userByNis = new Map(existingUsers.filter(u => u.nipNis).map(u => [u.nipNis, u]));

    const generatedResults: any[] = [];
    let successCount = 0;

    for (const student of students) {
      // 1. Generate unique username (format: bkXXX, e.g. bk384)
      let uniqueUsername = generateBkCode();
      while (usedUsernames.has(uniqueUsername.toLowerCase())) {
        uniqueUsername = generateBkCode();
      }
      usedUsernames.add(uniqueUsername.toLowerCase());

      // 2. Generate password (format: bkXXX, e.g. bk719)
      const plainPassword = generateBkCode();
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      // 3. Cek apakah murid sudah punya user akun sebelumnya
      const existingAccount = userByStudentId.get(student.id) || userByNis.get(student.nis);

      if (existingAccount) {
        // Update user account dengan username & password baru
        await prisma.user.update({
          where: { id: existingAccount.id },
          data: {
            username: uniqueUsername,
            passwordHash,
            name: student.name,
            nipNis: student.nis,
            studentId: student.id,
            role: 'MURID'
          }
        });
      } else {
        // Buat akun baru
        await prisma.user.create({
          data: {
            username: uniqueUsername,
            email: student.email || `${student.nis}@siswa.smp41jkt.sch.id`,
            passwordHash,
            role: 'MURID',
            name: student.name,
            nipNis: student.nis,
            studentId: student.id,
            mustChangePassword: false
          }
        });
      }

      generatedResults.push({
        namaSiswa: student.name,
        nis: student.nis,
        nisn: student.nisn,
        kelas: student.currentClass?.name || '-',
        username: uniqueUsername,
        password: plainPassword
      });

      successCount++;
    }

    // Catat ke Audit Activity Log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'GENERATE_STUDENT_ACCOUNTS',
        module: 'Manajemen Pengguna',
        details: `Berhasil men-generate ${successCount} akun login siswa dengan format kombinasi bk + 3 angka random`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil membuat ${successCount} akun login siswa dengan format huruf bk dan 3 digit acak.`,
      count: successCount,
      accounts: generatedResults
    });
  } catch (error: any) {
    console.error('Error generating student accounts:', error);
    return NextResponse.json({ error: 'Gagal men-generate akun murid: ' + error.message }, { status: 500 });
  }
}
