import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_GAYA_BELAJAR_ITEMS } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

// GET: Ambil butir Gaya Belajar & rekap kelas
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
          assessmentType: 'GAYA_BELAJAR',
          academicYear,
          semester
        },
        orderBy: { version: 'desc' }
      });
    }

    let classDistribution = { Visual: 0, Auditori: 0, Kinestetik: 0 };
    let studentSubmissions: any[] = [];

    if (['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      let studentWhere: any = { status: 'Aktif' };
      if (classId) studentWhere.currentClassId = classId;

      studentSubmissions = await prisma.assessmentSubmission.findMany({
        where: {
          assessmentType: 'GAYA_BELAJAR',
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
          if (sum.dominantStyle) {
            if (sum.dominantStyle.includes('Visual')) classDistribution.Visual += 1;
            else if (sum.dominantStyle.includes('Auditori')) classDistribution.Auditori += 1;
            else if (sum.dominantStyle.includes('Kinestetik')) classDistribution.Kinestetik += 1;
          }
        } catch (e) {}
      });
    }

    return NextResponse.json({
      items: DEFAULT_GAYA_BELAJAR_ITEMS,
      totalItems: DEFAULT_GAYA_BELAJAR_ITEMS.length,
      existingSubmission,
      classDistribution,
      studentSubmissions
    });
  } catch (error: any) {
    console.error('Error fetching Gaya Belajar:', error);
    return NextResponse.json({ error: 'Gagal memuat Gaya Belajar' }, { status: 500 });
  }
}

// POST: Simpan Pengerjaan Gaya Belajar
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

    const selectedItems = DEFAULT_GAYA_BELAJAR_ITEMS.filter(i => selectedItemIds.includes(i.id));

    const countVisual = selectedItems.filter(i => i.category === 'Visual').length;
    const countAuditori = selectedItems.filter(i => i.category === 'Auditori').length;
    const countKinestetik = selectedItems.filter(i => i.category === 'Kinestetik').length;

    const styles = [
      { name: 'Visual', count: countVisual },
      { name: 'Auditori', count: countAuditori },
      { name: 'Kinestetik', count: countKinestetik }
    ].sort((a, b) => b.count - a.count);

    const dominant = styles[0];
    const interpretation = `Preferensi Gaya Belajar dominan peserta didik adalah **Gaya Belajar ${dominant.name}** (${dominant.count} dari 5 indikator terpilih). Rincian Skor: Visual (${countVisual}), Auditori (${countAuditori}), Kinestetik (${countKinestetik}).`;

    let recommendations = '';
    if (dominant.name === 'Visual') {
      recommendations = 'Disarankan menggunakan sarana gambar, mind-mapping berwarna, diagram, dan rangkuman tulisan yang rapi saat belajar.';
    } else if (dominant.name === 'Auditori') {
      recommendations = 'Disarankan menggunakan metode diskusi, mendengarkan penjelasan lisan, membaca dengan suara keras, atau merekam materi audio.';
    } else {
      recommendations = 'Disarankan belajar dengan banyak praktik, gestur, simulasi fisik, membuat karya buatan tangan, serta diselingi istirahat bergerak secara teratur.';
    }

    const summaryData = {
      countVisual,
      countAuditori,
      countKinestetik,
      dominantStyle: dominant.name
    };

    const lastSub = await prisma.assessmentSubmission.findFirst({
      where: { studentId: targetStudentId, assessmentType: 'GAYA_BELAJAR', academicYear, semester },
      orderBy: { version: 'desc' }
    });
    const newVersion = (lastSub?.version || 0) + 1;

    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId: targetStudentId,
        assessmentType: 'GAYA_BELAJAR',
        academicYear,
        semester,
        version: newVersion,
        score: dominant.count,
        dominantResult: `Tipe ${dominant.name}`,
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
        assessmentName: `Gaya Belajar (${academicYear} - Semester ${semester})`,
        date: todayStr,
        academicYear,
        score: dominant.count,
        category: dominant.name,
        interpretation,
        attentionAreas: `Preferensi Dominan: ${dominant.name} (Visual:${countVisual}, Auditori:${countAuditori}, Kinestetik:${countKinestetik})`,
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
    console.error('Error submitting Gaya Belajar:', error);
    return NextResponse.json({ error: 'Gagal menyimpan Gaya Belajar: ' + error.message }, { status: 500 });
  }
}
