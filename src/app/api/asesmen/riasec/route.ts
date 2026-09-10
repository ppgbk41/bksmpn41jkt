import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_RIASEC_ITEMS, getHollandCode } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

// GET: Ambil butir RIASEC & rekap distribusi per kelas
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

    let existingSubmission = null;
    if (session.role === 'MURID' && session.studentId) {
      existingSubmission = await prisma.assessmentSubmission.findFirst({
        where: {
          studentId: session.studentId,
          assessmentType: 'RIASEC',
          academicYear,
          semester
        },
        orderBy: { version: 'desc' }
      });
    }

    let classDistribution: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    let studentSubmissions: any[] = [];

    if (['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      let studentWhere: any = { status: 'Aktif' };
      if (classId) studentWhere.currentClassId = classId;

      submissionsLoop:
      studentSubmissions = await prisma.assessmentSubmission.findMany({
        where: {
          assessmentType: 'RIASEC',
          academicYear,
          semester,
          student: studentWhere
        },
        include: {
          student: {
            select: { id: true, name: true, nisn: true, currentClass: { select: { id: true, name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      studentSubmissions.forEach(sub => {
        try {
          const sum = JSON.parse(sub.summaryJson || '{}');
          if (sum.scores) {
            Object.keys(sum.scores).forEach(dim => {
              if (classDistribution[dim] !== undefined) {
                classDistribution[dim] += sum.scores[dim] || 0;
              }
            });
          }
        } catch (e) {}
      });
    }

    return NextResponse.json({
      items: DEFAULT_RIASEC_ITEMS,
      totalItems: DEFAULT_RIASEC_ITEMS.length,
      existingSubmission,
      classDistribution,
      studentSubmissions
    });
  } catch (error: any) {
    console.error('Error fetching RIASEC:', error);
    return NextResponse.json({ error: 'Gagal memuat RIASEC' }, { status: 500 });
  }
}

// POST: Simpan Pengerjaan Asesmen Minat RIASEC
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { answers = {}, academicYear = '2025/2026', semester = 'Ganjil' } = body;
    // answers structure: { R01: 5, R02: 4, I01: 3, ... } (Skor 1-5 per item)

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

    // Calculate scores per dimension
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    DEFAULT_RIASEC_ITEMS.forEach(it => {
      const catCode = it.category.charAt(0).toUpperCase() as 'R'|'I'|'A'|'S'|'E'|'C';
      const val = parseInt(answers[it.id] || '0', 10);
      if (scores[catCode] !== undefined) {
        scores[catCode] += val;
      }
    });

    const holland = getHollandCode(scores);
    const interpretation = `Hasil evaluasi tipologi kepribadian Holland RIASEC menunjukkan profil dominan **${holland.code}** (${holland.dominant}). Rincian Skor per Dimensi: Realistic (${scores.R}), Investigative (${scores.I}), Artistic (${scores.A}), Social (${scores.S}), Enterprising (${scores.E}), Conventional (${scores.C}).`;

    const recommendations = `Siswa disarankan mengeksplorasi pilihan kegiatan ekstrakurikuler & karir yang selaras dengan tipe kepribadian ${holland.code}.`;

    const summaryData = {
      scores,
      hollandCode: holland.code,
      dominant: holland.dominant
    };

    const lastSub = await prisma.assessmentSubmission.findFirst({
      where: { studentId: targetStudentId, assessmentType: 'RIASEC', academicYear, semester },
      orderBy: { version: 'desc' }
    });
    const newVersion = (lastSub?.version || 0) + 1;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId: targetStudentId,
        assessmentType: 'RIASEC',
        academicYear,
        semester,
        version: newVersion,
        score: scores[holland.code.charAt(0) as keyof typeof scores] || 0,
        dominantResult: `Kode Holland: ${holland.code}`,
        rawAnswers: JSON.stringify(answers),
        summaryJson: JSON.stringify(summaryData),
        interpretation,
        recommendations,
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    // Save to AssessmentResult for legacy compatibility
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.assessmentResult.create({
      data: {
        studentId: targetStudentId,
        assessmentName: `RIASEC Holland (${academicYear} - Semester ${semester})`,
        date: todayStr,
        academicYear,
        score: 100,
        category: `Kode: ${holland.code}`,
        interpretation,
        attentionAreas: `Kode Holland 3 Tertinggi: ${holland.code}\nSkor R:${scores.R} I:${scores.I} A:${scores.A} S:${scores.S} E:${scores.E} C:${scores.C}`,
        recommendations,
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    return NextResponse.json({
      success: true,
      submission,
      summary: summaryData
    });
  } catch (error: any) {
    console.error('Error submitting RIASEC:', error);
    return NextResponse.json({ error: 'Gagal menyimpan hasil RIASEC: ' + error.message }, { status: 500 });
  }
}
