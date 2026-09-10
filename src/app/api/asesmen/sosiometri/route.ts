import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateSociometry } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

// GET: Ambil status sosiometri & data analisis matriks/sociogram (Khusus Guru BK/Admin)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';
    const semester = searchParams.get('semester') || 'Ganjil';
    const classId = searchParams.get('classId');

    // Siswa view: hanya mengambil daftar teman sekelas untuk dipilih & status pengerjaan sendiri
    if (session.role === 'MURID') {
      let targetStudentId = session.studentId;
      let studentClassId = '';

      if (!targetStudentId) {
        const studentObj = await prisma.student.findFirst({
          where: {
            OR: [
              { nis: session.username },
              { nisn: session.username },
              { nis: session.nipNis || '' },
              { nisn: session.nipNis || '' }
            ]
          }
        });
        if (studentObj) {
          targetStudentId = studentObj.id;
          studentClassId = studentObj.currentClassId;
        }
      } else {
        const studentObj = await prisma.student.findUnique({
          where: { id: targetStudentId },
          select: { currentClassId: true }
        });
        if (studentObj) {
          studentClassId = studentObj.currentClassId;
        }
      }

      let classmates: any[] = [];
      if (studentClassId) {
        classmates = await prisma.student.findMany({
          where: {
            currentClassId: studentClassId,
            id: { not: targetStudentId || '' },
            status: 'Aktif'
          },
          select: { id: true, name: true, nisn: true, nis: true },
          orderBy: { name: 'asc' }
        });
      }

      // Fallback: If no classmates in exact class (or if test student), load students from class 7A/8A/9A
      if (classmates.length === 0) {
        const firstClass = await prisma.class.findFirst({
          where: { students: { some: {} } },
          orderBy: { name: 'asc' }
        });
        if (firstClass) {
          classmates = await prisma.student.findMany({
            where: {
              currentClassId: firstClass.id,
              id: { not: targetStudentId || '' },
              status: 'Aktif'
            },
            select: { id: true, name: true, nisn: true, nis: true },
            orderBy: { name: 'asc' }
          });
        }
      }

      const existingSubmission = await prisma.assessmentSubmission.findFirst({
        where: {
          studentId: targetStudentId || '',
          assessmentType: 'SOSIOMETRI',
          academicYear,
          semester
        },
        orderBy: { version: 'desc' }
      });

      return NextResponse.json({
        classmates,
        existingSubmission,
        isStudent: true
      });
    }

    // Role Guru BK / Admin: Dapat mengakses Matriks Sosiometri & Sociogram
    if (!classId) {
      // Ambil kelas pertama jika tidak disediakan filter
      const firstClass = await prisma.class.findFirst({ orderBy: { name: 'asc' } });
      if (!firstClass) {
        return NextResponse.json({ error: 'Data kelas tidak ditemukan' }, { status: 404 });
      }
    }

    const targetClassId = classId || (await prisma.class.findFirst({ orderBy: { name: 'asc' } }))?.id || '';

    const classStudents = await prisma.student.findMany({
      where: { currentClassId: targetClassId, status: 'Aktif' },
      select: { id: true, name: true, nisn: true, gender: true },
      orderBy: { name: 'asc' }
    });

    const choices = await prisma.sociometricChoice.findMany({
      where: {
        classId: targetClassId,
        academicYear,
        semester
      }
    });

    const analysis = calculateSociometry(choices, classStudents);

    // Ambil siswa yang memiliki alert terisolasi (pilihan <= 1)
    const isolatedStudentObjects = classStudents.filter(s => analysis.isolatedStudents.includes(s.id));

    return NextResponse.json({
      classStudents,
      choicesCount: choices.length,
      analysis,
      isolatedStudents: isolatedStudentObjects,
      starStudentsCount: analysis.starStudents.length,
      isolatedStudentsCount: analysis.isolatedStudents.length,
      mutualPairsCount: analysis.mutualPairs.length
    });
  } catch (error: any) {
    console.error('Error fetching Sosiometri:', error);
    return NextResponse.json({ error: 'Gagal memuat modul sosiometri' }, { status: 500 });
  }
}

// POST: Simpan Pilihan Sosiometri oleh Siswa
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { choices = [], academicYear = '2025/2026', semester = 'Ganjil' } = body;
    // choices format: [ { toStudentId: "id1", choiceOrder: 1, criterion: "Belajar Kelompok" }, ... ]

    let targetStudentId = session.studentId;
    if (!targetStudentId) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ nis: session.username }, { nisn: session.username }] }
      });
      if (student) targetStudentId = student.id;
      else return NextResponse.json({ error: 'Data peserta didik tidak ditemukan' }, { status: 404 });
    }

    const studentRecord = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: { currentClass: true }
    });

    if (!studentRecord) {
      return NextResponse.json({ error: 'Profil siswa tidak valid' }, { status: 404 });
    }

    const lastSub = await prisma.assessmentSubmission.findFirst({
      where: { studentId: targetStudentId, assessmentType: 'SOSIOMETRI', academicYear, semester },
      orderBy: { version: 'desc' }
    });
    const newVersion = (lastSub?.version || 0) + 1;

    const summaryText = `Menyerahkan ${choices.length} pilihan sosiometri untuk kelas ${studentRecord.currentClass?.name}.`;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId: targetStudentId,
        assessmentType: 'SOSIOMETRI',
        academicYear,
        semester,
        version: newVersion,
        score: choices.length,
        dominantResult: `Selesai Memilih (${choices.length} Pilihan)`,
        rawAnswers: JSON.stringify(choices),
        summaryJson: JSON.stringify({ choicesCount: choices.length }),
        interpretation: summaryText,
        recommendations: 'Guru BK dapat meninjau peta hubungan sosial dan jaringan sosiometri kelas.',
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    // Save individual choices to SociometricChoice table
    for (const c of choices) {
      if (c.toStudentId) {
        await prisma.sociometricChoice.create({
          data: {
            submissionId: submission.id,
            academicYear,
            semester,
            classId: studentRecord.currentClassId,
            fromStudentId: targetStudentId,
            toStudentId: c.toStudentId,
            criterion: c.criterion || 'Belajar Kelompok',
            choiceOrder: c.choiceOrder || 1
          }
        });
      }
    }

    // Save to AssessmentResult for legacy view
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.assessmentResult.create({
      data: {
        studentId: targetStudentId,
        assessmentName: `Sosiometri Kelas (${academicYear} - Semester ${semester})`,
        date: todayStr,
        academicYear,
        score: choices.length,
        category: 'Selesai Mengisi',
        interpretation: summaryText,
        attentionAreas: 'Data pilihan sosiometri bersifat rahasia untuk analisis dinamika kelompok Guru BK.',
        recommendations: 'Peninjauan posisi sosial dan dinamika interaksi teman sekelas.',
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    return NextResponse.json({
      success: true,
      submission
    });
  } catch (error: any) {
    console.error('Error submitting Sosiometri:', error);
    return NextResponse.json({ error: 'Gagal menyimpan sosiometri: ' + error.message }, { status: 500 });
  }
}
