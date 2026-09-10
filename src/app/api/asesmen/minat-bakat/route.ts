import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_MINAT_BAKAT_ITEMS } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

const MINAT_BAKAT_ITEMS = DEFAULT_MINAT_BAKAT_ITEMS;

// GET: Ambil daftar soal & rekap kelas
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
          assessmentType: 'MINAT_BAKAT',
          academicYear,
          semester
        },
        orderBy: { version: 'desc' }
      });
    }

    let studentSubmissions: any[] = [];
    if (['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      let studentWhere: any = { status: 'Aktif' };
      if (classId) studentWhere.currentClassId = classId;

      studentSubmissions = await prisma.assessmentSubmission.findMany({
        where: {
          assessmentType: 'MINAT_BAKAT',
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
    }

    return NextResponse.json({
      items: MINAT_BAKAT_ITEMS,
      totalItems: MINAT_BAKAT_ITEMS.length,
      existingSubmission,
      studentSubmissions
    });
  } catch (error: any) {
    console.error('Error fetching Minat Bakat:', error);
    return NextResponse.json({ error: 'Gagal memuat Minat & Bakat' }, { status: 500 });
  }
}

// POST: Simpan Minat & Bakat Siswa
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { selectedItemIds = [], academicYear = '2025/2026', semester = 'Ganjil' } = body;

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

    const selectedItems = MINAT_BAKAT_ITEMS.filter(i => selectedItemIds.includes(i.id));

    // Count score per dimension
    const dimensionCounts: Record<string, number> = {};
    MINAT_BAKAT_ITEMS.forEach(it => {
      if (!dimensionCounts[it.category]) dimensionCounts[it.category] = 0;
    });

    selectedItems.forEach(it => {
      dimensionCounts[it.category] = (dimensionCounts[it.category] || 0) + 1;
    });

    const sortedDimensions = Object.entries(dimensionCounts).sort((a, b) => b[1] - a[1]);
    const topDimension = sortedDimensions[0] || ['Linguistik (Bahasa)', 0];

    const interpretation = `Profil Minat & Bakat dominan peserta didik menunjukkan potensi utama pada kecerdasan **${topDimension[0]}** (${topDimension[1]} indikator terpilih).`;

    const recommendations = `Peserta didik disarankan mengikuti kegiatan pengembangan bakat dan ekstrakurikuler yang selaras dengan potensi ${topDimension[0]}.`;

    const summaryData = {
      dimensionCounts,
      topDimension: topDimension[0],
      topScore: topDimension[1]
    };

    const lastSub = await prisma.assessmentSubmission.findFirst({
      where: { studentId: targetStudentId, assessmentType: 'MINAT_BAKAT', academicYear, semester },
      orderBy: { version: 'desc' }
    });
    const newVersion = (lastSub?.version || 0) + 1;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId: targetStudentId,
        assessmentType: 'MINAT_BAKAT',
        academicYear,
        semester,
        version: newVersion,
        score: topDimension[1],
        dominantResult: topDimension[0],
        rawAnswers: JSON.stringify(selectedItemIds),
        summaryJson: JSON.stringify(summaryData),
        interpretation,
        recommendations,
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    // Save to AssessmentResult
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.assessmentResult.create({
      data: {
        studentId: targetStudentId,
        assessmentName: `Minat & Bakat (${academicYear} - Semester ${semester})`,
        date: todayStr,
        academicYear,
        score: topDimension[1],
        category: topDimension[0],
        interpretation,
        attentionAreas: `Dominan: ${topDimension[0]} (${topDimension[1]} Indikator)`,
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
    console.error('Error submitting Minat Bakat:', error);
    return NextResponse.json({ error: 'Gagal menyimpan Minat & Bakat: ' + error.message }, { status: 500 });
  }
}
