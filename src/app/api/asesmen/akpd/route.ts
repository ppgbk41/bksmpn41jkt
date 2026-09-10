import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { DEFAULT_AKPD_ITEMS, evaluateAssessmentAlert } from '@/lib/assessment-data';

export const dynamic = 'force-dynamic';

// GET: Ambil butir AKPD (dengan severity dari config) & rekap data
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

    // Load severity configs
    const configs = await prisma.assessmentItemConfig.findMany({
      where: { assessmentType: 'AKPD' }
    });
    const severityMap: Record<string, string> = {};
    configs.forEach(c => {
      severityMap[c.itemCode] = c.severity;
    });

    const items = DEFAULT_AKPD_ITEMS.map((it, idx) => ({
      ...it,
      orderIndex: idx + 1,
      severity: severityMap[it.id] || it.severity || 'NORMAL'
    }));

    let existingResult = null;
    let existingSubmission = null;

    if (session.role === 'MURID' && session.studentId) {
      existingSubmission = await prisma.assessmentSubmission.findFirst({
        where: {
          studentId: session.studentId,
          assessmentType: 'AKPD',
          academicYear,
          semester
        },
        orderBy: { version: 'desc' }
      });

      existingResult = await prisma.assessmentResult.findFirst({
        where: {
          studentId: session.studentId,
          assessmentName: { contains: 'AKPD' }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    // Rekapitulasi per butir & per siswa jika role BK / Admin
    let itemAnalysis: Record<string, { count: number; percentage: number; studentNames: string[]; severity: string }> = {};
    let studentSubmissions: any[] = [];
    let fieldDistribution = { Pribadi: 0, Sosial: 0, Belajar: 0, Karier: 0 };
    let topNeedsInClass: Array<{ code: string; text: string; category: string; count: number; pct: number }> = [];

    if (['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      let studentWhere: any = { status: 'Aktif' };
      if (classId) studentWhere.currentClassId = classId;

      const submissions = await prisma.assessmentSubmission.findMany({
        where: {
          assessmentType: 'AKPD',
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

      const totalClassSubmissions = submissions.length;

      // Populate item analysis
      items.forEach(it => {
        itemAnalysis[it.id] = { count: 0, percentage: 0, studentNames: [], severity: it.severity };
      });

      submissions.forEach(sub => {
        let rawSelectedIds: string[] = [];
        try {
          rawSelectedIds = JSON.parse(sub.rawAnswers || '[]');
        } catch (e) {
          rawSelectedIds = [];
        }

        rawSelectedIds.forEach(id => {
          if (itemAnalysis[id]) {
            itemAnalysis[id].count += 1;
            if (sub.student?.name) {
              itemAnalysis[id].studentNames.push(`${sub.student.name} (${sub.student.currentClass?.name || ''})`);
            }
          }
        });

        // Summary JSON parsing
        try {
          const sum = JSON.parse(sub.summaryJson || '{}');
          if (sum.pribadi) fieldDistribution.Pribadi += sum.pribadi.count || 0;
          if (sum.sosial) fieldDistribution.Sosial += sum.sosial.count || 0;
          if (sum.belajar) fieldDistribution.Belajar += sum.belajar.count || 0;
          if (sum.karier) fieldDistribution.Karier += sum.karier.count || 0;
        } catch (e) {}
      });

      // Calculate percentage for each item
      topNeedsInClass = items.map(it => {
        const count = itemAnalysis[it.id]?.count || 0;
        const pct = totalClassSubmissions > 0 ? Math.round((count / totalClassSubmissions) * 100) : 0;
        itemAnalysis[it.id].percentage = pct;
        return {
          code: it.id,
          text: it.text,
          category: it.category,
          count,
          pct
        };
      }).sort((a, b) => b.count - a.count);

      studentSubmissions = submissions;
    }

    return NextResponse.json({
      items,
      totalItems: items.length,
      existingResult,
      existingSubmission,
      itemAnalysis,
      studentSubmissions,
      fieldDistribution,
      topNeedsInClass: topNeedsInClass.slice(0, 10)
    });
  } catch (error: any) {
    console.error('Error fetching AKPD:', error);
    return NextResponse.json({ error: 'Gagal memuat AKPD' }, { status: 500 });
  }
}

// POST: Simpan Pengerjaan AKPD Siswa
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

    // Load custom severities
    const configs = await prisma.assessmentItemConfig.findMany({
      where: { assessmentType: 'AKPD' }
    });
    const severityMap: Record<string, string> = {};
    configs.forEach(c => { severityMap[c.itemCode] = c.severity; });

    const items = DEFAULT_AKPD_ITEMS.map(it => ({
      ...it,
      severity: severityMap[it.id] || it.severity || 'NORMAL'
    }));

    const selectedItems = items.filter(i => selectedItemIds.includes(i.id));

    // Distribution calculation
    const countPribadi = selectedItems.filter(i => i.category === 'Pribadi').length;
    const countSosial = selectedItems.filter(i => i.category === 'Sosial').length;
    const countBelajar = selectedItems.filter(i => i.category === 'Belajar').length;
    const countKarier = selectedItems.filter(i => i.category === 'Karier').length;

    const totalSelected = selectedItems.length;
    const percentPribadi = Math.round((countPribadi / 10) * 100);
    const percentSosial = Math.round((countSosial / 10) * 100);
    const percentBelajar = Math.round((countBelajar / 10) * 100);
    const percentKarier = Math.round((countKarier / 10) * 100);

    const scores = [
      { name: 'Belajar', val: countBelajar, pct: percentBelajar },
      { name: 'Pribadi', val: countPribadi, pct: percentPribadi },
      { name: 'Sosial', val: countSosial, pct: percentSosial },
      { name: 'Karier', val: countKarier, pct: percentKarier }
    ].sort((a, b) => b.val - a.val);

    const dominantField = scores[0];
    const categoryStatus = totalSelected >= 15 ? 'Kebutuhan Tinggi' : totalSelected >= 7 ? 'Kebutuhan Sedang' : 'Kebutuhan Rendah';

    const interpretation = `Hasil AKPD menunjukkan peserta didik memiliki ${totalSelected} butir kebutuhan prioritas (${categoryStatus}). Kebutuhan tertinggi berada pada Bidang ${dominantField.name} (${dominantField.pct}%). Rincian 4 Bidang Layanan: Belajar (${percentBelajar}%), Pribadi (${percentPribadi}%), Sosial (${percentSosial}%), dan Karier (${percentKarier}%).`;

    const attentionAreasList = selectedItems.map((it, idx) => `${idx + 1}. [${it.category}] (${it.id}) ${it.text}`).join('\n');

    let recommendations = '';
    if (dominantField.name === 'Belajar') {
      recommendations = 'Diberikan layanan Bimbingan Klasikal mengenai Manajemen Waktu & Strategi Belajar Efektif serta konseling individual untuk prokrastinasi.';
    } else if (dominantField.name === 'Pribadi') {
      recommendations = 'Diberikan layanan Bimbingan Kelompok tentang Regulasi Emosi, Kepercayaan Diri, dan Pembinaan Karakter Positif.';
    } else if (dominantField.name === 'Sosial') {
      recommendations = 'Diberikan bimbingan klasikal mengenai Etika Pertemanan Sehat, Komunikasi Asertif, dan Sosialisasi Pencegahan Perundungan (Anti-Bullying).';
    } else {
      recommendations = 'Diberikan layanan Bimbingan Karier mengenai Eksplorasi Cita-cita dan Peminatan Sekolah Lanjutan (SMA/SMK).';
    }

    const summaryData = {
      totalSelected,
      pribadi: { count: countPribadi, percent: percentPribadi },
      sosial: { count: countSosial, percent: percentSosial },
      belajar: { count: countBelajar, percent: percentBelajar },
      karier: { count: countKarier, percent: percentKarier },
      dominantField: dominantField.name,
      categoryStatus
    };

    // Determine version
    const lastSub = await prisma.assessmentSubmission.findFirst({
      where: { studentId: targetStudentId, assessmentType: 'AKPD', academicYear, semester },
      orderBy: { version: 'desc' }
    });

    const newVersion = (lastSub?.version || 0) + 1;

    // Save to AssessmentSubmission
    const submission = await prisma.assessmentSubmission.create({
      data: {
        studentId: targetStudentId,
        assessmentType: 'AKPD',
        academicYear,
        semester,
        version: newVersion,
        score: totalSelected,
        dominantResult: `Dominan ${dominantField.name} (${categoryStatus})`,
        rawAnswers: JSON.stringify(selectedItemIds),
        summaryJson: JSON.stringify(summaryData),
        interpretation,
        recommendations,
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    // Also update / create AssessmentResult for legacy view
    const todayStr = new Date().toISOString().split('T')[0];
    await prisma.assessmentResult.create({
      data: {
        studentId: targetStudentId,
        assessmentName: `AKPD (${academicYear} - Semester ${semester})`,
        date: todayStr,
        academicYear,
        score: totalSelected,
        category: `${categoryStatus} (Dominan: ${dominantField.name})`,
        interpretation,
        attentionAreas: attentionAreasList,
        recommendations,
        bkTeacherName: 'Guru BK SMPN 41 Jakarta'
      }
    });

    // Evaluate Assessment Alert System
    const alertEval = evaluateAssessmentAlert(studentRecord.name, studentRecord.currentClass?.name || '7A', selectedItems as any, severityMap);

    if (alertEval.hasAlert) {
      await prisma.assessmentAlert.create({
        data: {
          studentId: targetStudentId,
          submissionId: submission.id,
          assessmentType: 'AKPD',
          title: alertEval.title,
          description: alertEval.description,
          severity: alertEval.severity,
          status: 'new'
        }
      });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: targetStudentId,
        title: 'Asesmen AKPD Selesai Diisi',
        message: `${studentRecord.name} (Kelas ${studentRecord.currentClass?.name}) telah menyelesaikan AKPD Online (Dominan: ${dominantField.name}).`,
        type: 'ASSESSMENT',
        link: `/siswa/${targetStudentId}`
      }
    });

    return NextResponse.json({
      success: true,
      submission,
      summary: summaryData,
      alert: alertEval.hasAlert ? alertEval : null
    });
  } catch (error: any) {
    console.error('Error submitting AKPD:', error);
    return NextResponse.json({ error: 'Gagal menyimpan jawaban AKPD: ' + error.message }, { status: 500 });
  }
}
