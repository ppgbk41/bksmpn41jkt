import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Ambil semua kelas beserta statistik siswa dan wali kelas yang ditugaskan
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');

    let whereClause: any = {};
    if (level && level !== 'ALL') {
      whereClause.level = parseInt(level);
    }

    const [classes, teachers, activeAY] = await Promise.all([
      prisma.class.findMany({
        where: whereClause,
        include: {
          students: {
            select: {
              id: true,
              gender: true,
              status: true
            }
          }
        },
        orderBy: [
          { level: 'asc' },
          { section: 'asc' }
        ]
      }),
      prisma.user.findMany({
        where: {
          role: { in: ['WALI_KELAS', 'GURU_BK', 'ADMIN'] }
        },
        select: {
          id: true,
          name: true,
          nipNis: true,
          role: true,
          username: true,
          activeClassId: true
        },
        orderBy: { name: 'asc' }
      }),
      prisma.academicYear.findFirst({ where: { isCurrent: true } })
    ]);

    // Format data kelas
    const formattedClasses = classes.map(c => {
      const activeStudents = c.students.filter(s => s.status === 'Aktif');
      const maleCount = activeStudents.filter(s => s.gender === 'L').length;
      const femaleCount = activeStudents.filter(s => s.gender === 'P').length;
      const assignedTeacherUser = teachers.find(t => t.activeClassId === c.id);

      return {
        id: c.id,
        name: c.name,
        level: c.level,
        section: c.section,
        academicYear: c.academicYear,
        teacherName: c.teacherName || assignedTeacherUser?.name || 'Belum Ditentukan',
        teacherNip: c.teacherNip || assignedTeacherUser?.nipNis || '-',
        assignedUserId: assignedTeacherUser?.id || null,
        totalStudents: activeStudents.length,
        maleCount,
        femaleCount
      };
    });

    return NextResponse.json({
      classes: formattedClasses,
      teachers,
      activeAcademicYear: activeAY?.year || '2025/2026'
    });
  } catch (error: any) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}

// POST: Tambah Kelas Baru
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { name, level, section, teacherName, teacherNip, assignedUserId } = body;

    const formattedName = String(name || `${level}${section}`).toUpperCase().trim();

    if (!formattedName || !level || !section) {
      return NextResponse.json({ error: 'Nama kelas, tingkat, dan ruang wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.class.findUnique({ where: { name: formattedName } });
    if (existing) {
      return NextResponse.json({ error: `Kelas ${formattedName} sudah ada` }, { status: 400 });
    }

    const activeAY = await prisma.academicYear.findFirst({ where: { isCurrent: true } });

    let finalTeacherName = teacherName || null;
    let finalTeacherNip = teacherNip || null;

    if (assignedUserId) {
      const selectedUser = await prisma.user.findUnique({ where: { id: assignedUserId } });
      if (selectedUser) {
        finalTeacherName = selectedUser.name;
        finalTeacherNip = selectedUser.nipNis || finalTeacherNip;
      }
    }

    const newClass = await prisma.class.create({
      data: {
        name: formattedName,
        level: parseInt(level),
        section: String(section).toUpperCase().trim(),
        academicYear: activeAY?.year || '2025/2026',
        teacherName: finalTeacherName,
        teacherNip: finalTeacherNip
      }
    });

    // Jika ada user guru yang dipilih, tautkan activeClassId
    if (assignedUserId) {
      await prisma.user.update({
        where: { id: assignedUserId },
        data: { activeClassId: newClass.id }
      });
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'CREATE_CLASS',
        module: 'Pengaturan Kelas',
        details: `Menambahkan kelas baru: ${formattedName} (Wali Kelas: ${finalTeacherName || 'Belum diatur'})`
      }
    });

    return NextResponse.json({ success: true, class: newClass });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Gagal membuat kelas baru' }, { status: 500 });
  }
}

// PUT: Perbarui Kelas & Penetapan Wali Kelas
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, level, section, teacherName, teacherNip, assignedUserId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID kelas wajib disertakan' }, { status: 400 });
    }

    const targetClass = await prisma.class.findUnique({ where: { id } });
    if (!targetClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    let finalTeacherName = teacherName || targetClass.teacherName;
    let finalTeacherNip = teacherNip || targetClass.teacherNip;

    if (assignedUserId) {
      const selectedUser = await prisma.user.findUnique({ where: { id: assignedUserId } });
      if (selectedUser) {
        finalTeacherName = selectedUser.name;
        finalTeacherNip = selectedUser.nipNis || finalTeacherNip;

        // Reset kelas dari wali kelas sebelumnya jika ada
        await prisma.user.updateMany({
          where: { activeClassId: id, id: { not: assignedUserId } },
          data: { activeClassId: null }
        });

        // Set ke wali kelas baru
        await prisma.user.update({
          where: { id: assignedUserId },
          data: { activeClassId: id }
        });
      }
    } else if (assignedUserId === null) {
      // Hapus tautan wali kelas
      await prisma.user.updateMany({
        where: { activeClassId: id },
        data: { activeClassId: null }
      });
      finalTeacherName = null;
      finalTeacherNip = null;
    }

    const updated = await prisma.class.update({
      where: { id },
      data: {
        ...(name ? { name: String(name).toUpperCase().trim() } : {}),
        ...(level ? { level: parseInt(level) } : {}),
        ...(section ? { section: String(section).toUpperCase().trim() } : {}),
        teacherName: finalTeacherName,
        teacherNip: finalTeacherNip
      }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'UPDATE_CLASS',
        module: 'Pengaturan Kelas',
        details: `Memperbarui kelas: ${updated.name} (Wali Kelas: ${finalTeacherName || 'Dikosongkan'})`
      }
    });

    return NextResponse.json({ success: true, class: updated });
  } catch (error: any) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Gagal memperbarui kelas' }, { status: 500 });
  }
}

// DELETE: Hapus Kelas
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Administrator yang dapat menghapus kelas' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kelas wajib disertakan' }, { status: 400 });
    }

    const targetClass = await prisma.class.findUnique({
      where: { id },
      include: {
        _count: { select: { students: true } }
      }
    });

    if (!targetClass) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    if (targetClass._count.students > 0) {
      return NextResponse.json({
        error: `Tidak dapat menghapus kelas ${targetClass.name} karena masih memiliki ${targetClass._count.students} peserta didik. Pindahkan siswa terlebih dahulu.`
      }, { status: 400 });
    }

    // Lepas activeClassId dari user wali kelas
    await prisma.user.updateMany({
      where: { activeClassId: id },
      data: { activeClassId: null }
    });

    await prisma.class.delete({ where: { id } });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'DELETE_CLASS',
        module: 'Pengaturan Kelas',
        details: `Menghapus kelas: ${targetClass.name}`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Gagal menghapus kelas' }, { status: 500 });
  }
}
