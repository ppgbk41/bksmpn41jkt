import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const {
      sourceYear,
      targetYear,
      semester = 'Ganjil',
      graduateGrade9 = true,
      promoteGrade8 = true,
      promoteGrade7 = true,
      retainedStudentIds = [],
      activateTargetYear = true
    } = body;

    if (!sourceYear || !targetYear) {
      return NextResponse.json({ error: 'Tahun asal dan tahun tujuan wajib diisi' }, { status: 400 });
    }

    // 1. Pastikan target AcademicYear ada di database atau buatkan jika belum
    let targetAcademicYear = await prisma.academicYear.findUnique({
      where: { year: targetYear }
    });

    if (!targetAcademicYear) {
      targetAcademicYear = await prisma.academicYear.create({
        data: {
          year: targetYear,
          semester: semester,
          isCurrent: Boolean(activateTargetYear)
        }
      });
    } else if (activateTargetYear) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
      await prisma.academicYear.update({
        where: { id: targetAcademicYear.id },
        data: { isCurrent: true, semester }
      });
    }

    // Ambil semua data kelas
    const allClasses = await prisma.class.findMany();
    const classMapByName = new Map(allClasses.map(c => [c.name, c]));

    // Ambil seluruh siswa aktif
    const activeStudents = await prisma.student.findMany({
      where: { status: 'Aktif' },
      include: { currentClass: true }
    });

    let graduatedCount = 0;
    let promotedGrade8Count = 0;
    let promotedGrade7Count = 0;
    let retainedCount = 0;

    for (const student of activeStudents) {
      const isRetained = retainedStudentIds.includes(student.id);
      const currentLevel = student.currentClass.level;
      const currentSection = student.currentClass.section;
      const currentClassName = student.currentClass.name;

      if (isRetained) {
        // Catat riwayat tinggal kelas
        await prisma.studentClassHistory.create({
          data: {
            studentId: student.id,
            academicYear: sourceYear,
            className: currentClassName,
            status: 'Tetap'
          }
        });
        retainedCount++;
        continue;
      }

      // KELAS 9: LULUS
      if (currentLevel === 9 && graduateGrade9) {
        // 1. Simpan riwayat kelulusan
        await prisma.studentClassHistory.create({
          data: {
            studentId: student.id,
            academicYear: sourceYear,
            className: currentClassName,
            status: 'Lulus'
          }
        });

        // 2. Ubah status siswa menjadi Lulus
        await prisma.student.update({
          where: { id: student.id },
          data: { status: 'Lulus' }
        });

        graduatedCount++;
      }
      // KELAS 8: NAIK KE KELAS 9
      else if (currentLevel === 8 && promoteGrade8) {
        const nextClassName = `9${currentSection}`;
        const targetClass = classMapByName.get(nextClassName);

        if (targetClass) {
          // 1. Simpan riwayat kelas 8
          await prisma.studentClassHistory.create({
            data: {
              studentId: student.id,
              academicYear: sourceYear,
              className: currentClassName,
              status: 'Naik Kelas'
            }
          });

          // 2. Pindahkan ke kelas 9
          await prisma.student.update({
            where: { id: student.id },
            data: { currentClassId: targetClass.id }
          });

          promotedGrade8Count++;
        }
      }
      // KELAS 7: NAIK KE KELAS 8
      else if (currentLevel === 7 && promoteGrade7) {
        const nextClassName = `8${currentSection}`;
        const targetClass = classMapByName.get(nextClassName);

        if (targetClass) {
          // 1. Simpan riwayat kelas 7
          await prisma.studentClassHistory.create({
            data: {
              studentId: student.id,
              academicYear: sourceYear,
              className: currentClassName,
              status: 'Naik Kelas'
            }
          });

          // 2. Pindahkan ke kelas 8
          await prisma.student.update({
            where: { id: student.id },
            data: { currentClassId: targetClass.id }
          });

          promotedGrade7Count++;
        }
      }
    }

    // Update tahun ajaran di master kelas
    if (activateTargetYear) {
      await prisma.class.updateMany({
        data: { academicYear: targetYear }
      });
    }

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'PROMOTE_ACADEMIC_YEAR',
        module: 'Tahun Ajaran & Kenaikan Kelas',
        details: `Melakukan transisi tahun ajaran ${sourceYear} ke ${targetYear}: ${graduatedCount} siswa Kelas IX lulus, ${promotedGrade8Count} siswa Kelas VIII naik ke IX, ${promotedGrade7Count} siswa Kelas VII naik ke VIII, ${retainedCount} siswa tinggal kelas.`
      }
    });

    return NextResponse.json({
      success: true,
      message: `Transisi tahun ajaran ${targetYear} berhasil diproses`,
      summary: {
        graduatedCount,
        promotedGrade8Count,
        promotedGrade7Count,
        retainedCount,
        totalProcessed: graduatedCount + promotedGrade8Count + promotedGrade7Count + retainedCount
      }
    });
  } catch (error: any) {
    console.error('Error promoting academic year:', error);
    return NextResponse.json({ error: 'Gagal memproses kenaikan kelas: ' + error.message }, { status: 500 });
  }
}
