import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Ambil semua tahun ajaran beserta statistik siswa & kelas
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const academicYears = await prisma.academicYear.findMany({
      orderBy: { year: 'desc' }
    });

    // Ambil statistik per tingkat kelas
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    const activeYear = academicYears.find(ay => ay.isCurrent) || academicYears[0];

    const stats = {
      totalClasses: classes.length,
      grade7Count: classes.filter(c => c.level === 7).reduce((acc, c) => acc + c._count.students, 0),
      grade8Count: classes.filter(c => c.level === 8).reduce((acc, c) => acc + c._count.students, 0),
      grade9Count: classes.filter(c => c.level === 9).reduce((acc, c) => acc + c._count.students, 0),
      graduatedCount: await prisma.student.count({ where: { status: 'Lulus' } }),
      activeStudentsCount: await prisma.student.count({ where: { status: 'Aktif' } })
    };

    return NextResponse.json({ academicYears, activeYear, stats, classes });
  } catch (error: any) {
    console.error('Error fetching academic years:', error);
    return NextResponse.json({ error: 'Gagal mengambil data tahun ajaran' }, { status: 500 });
  }
}

// POST: Buat Tahun Ajaran Baru
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { year, semester, setAsCurrent } = body;

    if (!year || !semester) {
      return NextResponse.json({ error: 'Tahun dan semester wajib diisi (Contoh: 2026/2027, Ganjil)' }, { status: 400 });
    }

    const existing = await prisma.academicYear.findUnique({ where: { year } });
    if (existing) {
      return NextResponse.json({ error: `Tahun ajaran ${year} sudah ada` }, { status: 400 });
    }

    if (setAsCurrent) {
      // Nonaktifkan tahun ajaran aktif sebelumnya
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const newYear = await prisma.academicYear.create({
      data: {
        year,
        semester,
        isCurrent: Boolean(setAsCurrent)
      }
    });

    // Update academicYear di kelas jika diset sebagai aktif
    if (setAsCurrent) {
      await prisma.class.updateMany({
        data: { academicYear: year }
      });
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'CREATE_ACADEMIC_YEAR',
        module: 'Tahun Ajaran',
        details: `Menambahkan tahun ajaran baru: ${year} (${semester})${setAsCurrent ? ' dan diaktifkan' : ''}`
      }
    });

    return NextResponse.json({ success: true, academicYear: newYear });
  } catch (error: any) {
    console.error('Error creating academic year:', error);
    return NextResponse.json({ error: 'Gagal membuat tahun ajaran' }, { status: 500 });
  }
}

// PUT: Ganti Tahun Ajaran Aktif
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { id, semester } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID tahun ajaran wajib disertakan' }, { status: 400 });
    }

    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'Tahun ajaran tidak ditemukan' }, { status: 404 });
    }

    // Set semua tahun ajaran lain menjadi isCurrent = false
    await prisma.academicYear.updateMany({
      data: { isCurrent: false }
    });

    // Aktifkan tahun ajaran yang dipilih
    const updated = await prisma.academicYear.update({
      where: { id },
      data: {
        isCurrent: true,
        ...(semester ? { semester } : {})
      }
    });

    // Sinkronkan ke kelas
    await prisma.class.updateMany({
      data: { academicYear: target.year }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'UPDATE_ACTIVE_ACADEMIC_YEAR',
        module: 'Tahun Ajaran',
        details: `Mengaktifkan tahun ajaran: ${target.year} (${semester || target.semester})`
      }
    });

    return NextResponse.json({ success: true, academicYear: updated });
  } catch (error: any) {
    console.error('Error updating active academic year:', error);
    return NextResponse.json({ error: 'Gagal mengaktifkan tahun ajaran' }, { status: 500 });
  }
}

// DELETE: Hapus Tahun Ajaran
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin yang dapat menghapus tahun ajaran' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });
    }

    const target = await prisma.academicYear.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'Tahun ajaran tidak ditemukan' }, { status: 404 });
    }

    if (target.isCurrent) {
      return NextResponse.json({ error: 'Tidak dapat menghapus tahun ajaran yang sedang aktif' }, { status: 400 });
    }

    await prisma.academicYear.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'DELETE_ACADEMIC_YEAR',
        module: 'Tahun Ajaran',
        details: `Menghapus tahun ajaran: ${target.year} (${target.semester})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting academic year:', error);
    return NextResponse.json({ error: 'Gagal menghapus tahun ajaran' }, { status: 500 });
  }
}
