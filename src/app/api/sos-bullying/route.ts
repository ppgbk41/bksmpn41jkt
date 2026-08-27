import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar laporan SOS Bullying sesuai peran pengguna
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const urgency = searchParams.get('urgency');

    let whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (urgency && urgency !== 'ALL') {
      whereClause.urgencyLevel = urgency;
    }

    // Role-based Access:
    // - MURID: hanya melihat laporannya sendiri
    // - WALI_KELAS: melihat laporan siswa di kelasnya
    // - GURU_BK & ADMIN: melihat semua laporan
    if (session.role === 'MURID') {
      whereClause.OR = [
        { victimStudentId: session.studentId },
        { reporterContact: session.username }
      ];
    } else if (session.role === 'WALI_KELAS' && session.activeClassId) {
      const homeroomClass = await prisma.class.findUnique({ where: { id: session.activeClassId } });
      if (homeroomClass) {
        whereClause.victimClass = homeroomClass.name;
      }
    }

    const reports = await prisma.bullyingReport.findMany({
      where: whereClause,
      include: {
        victimStudent: {
          select: {
            id: true,
            name: true,
            nis: true,
            gender: true,
            currentClass: true
          }
        }
      },
      orderBy: [
        { urgencyLevel: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    const stats = {
      total: reports.length,
      urgentCount: reports.filter(r => r.urgencyLevel === 'DARURAT').length,
      newCount: reports.filter(r => r.status === 'BARU').length,
      inProgressCount: reports.filter(r => ['DIPROSES', 'INVESTIGASI', 'MEDIASI'].includes(r.status)).length,
      resolvedCount: reports.filter(r => r.status === 'SELESAI').length
    };

    return NextResponse.json({ reports, stats });
  } catch (error: any) {
    console.error('Error fetching bullying reports:', error);
    return NextResponse.json({ error: 'Gagal mengambil data laporan SOS Bullying' }, { status: 500 });
  }
}

// POST: Buat Laporan Darurat SOS Bullying Baru
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();

    const {
      victimName,
      victimClass,
      victimStudentId,
      category,
      urgencyLevel = 'TINGGI',
      incidentDate,
      incidentLocation,
      chronology,
      perpetrators,
      witnesses,
      evidenceUrl,
      isAnonymous = false,
      reporterName,
      reporterContact
    } = body;

    if (!victimName || !victimClass || !category || !chronology) {
      return NextResponse.json({
        error: 'Nama korban, kelas, kategori perundungan, dan kronologi wajib diisi'
      }, { status: 400 });
    }

    // Generate No Laporan unik (Contoh: SOS-202608-001)
    const todayStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = await prisma.bullyingReport.count();
    const reportNo = `SOS-${todayStr}-${String(count + 1).padStart(3, '0')}`;

    let reporterRole = session?.role || 'ANONIM';
    let finalReporterName = isAnonymous ? 'Anonim (Dirahasiakan)' : (reporterName || session?.name || 'Siswa / Saksi');

    // Validate victimStudentId to prevent MySQL Foreign Key Constraint errors
    let validStudentId: string | null = null;
    if (victimStudentId && typeof victimStudentId === 'string' && victimStudentId.trim().length > 0) {
      const existingStudent = await prisma.student.findUnique({
        where: { id: victimStudentId },
        select: { id: true }
      });
      if (existingStudent) {
        validStudentId = existingStudent.id;
      }
    }

    // Auto-match student if victimStudentId was not provided or invalid
    if (!validStudentId && victimName) {
      const matched = await prisma.student.findFirst({
        where: {
          name: { contains: victimName.trim() }
        },
        select: { id: true }
      });
      if (matched) {
        validStudentId = matched.id;
      }
    }

    const report = await prisma.bullyingReport.create({
      data: {
        reportNo,
        reporterRole,
        reporterName: finalReporterName,
        reporterContact: isAnonymous ? null : (reporterContact || session?.username || null),
        isAnonymous: Boolean(isAnonymous),
        victimStudentId: validStudentId,
        victimName: victimName.trim(),
        victimClass: victimClass.trim().toUpperCase(),
        category,
        urgencyLevel,
        incidentDate: incidentDate || new Date().toISOString().split('T')[0],
        incidentLocation: incidentLocation || 'Lingkungan Sekolah',
        chronology,
        perpetrators: perpetrators || null,
        witnesses: witnesses || null,
        evidenceUrl: evidenceUrl || null,
        status: 'BARU'
      }
    });

    // Buat Notifikasi Darurat untuk Guru BK & Admin
    await prisma.notification.create({
      data: {
        targetRole: 'GURU_BK',
        title: `🚨 PANGGILAN DARURAT: SOS Bullying (${reportNo})`,
        message: `Laporan dugaan perundungan (${category}) pada siswa ${victimName} (Kelas ${victimClass}). Tingkat Urgensi: ${urgencyLevel}.`,
        type: 'SOS_BULLYING',
        link: '/sos-bullying'
      }
    });

    await prisma.notification.create({
      data: {
        targetRole: 'ADMIN',
        title: `🚨 SOS Bullying Masuk (${reportNo})`,
        message: `Laporan perundungan baru terdaftar untuk kelas ${victimClass}.`,
        type: 'SOS_BULLYING',
        link: '/sos-bullying'
      }
    });

    // Catat ke Audit Activity Log
    await prisma.activityLog.create({
      data: {
        userId: session?.id || 'SYSTEM_SOS',
        userName: finalReporterName,
        userRole: reporterRole,
        action: 'SOS_BULLYING_REPORT',
        module: 'SOS Bullying',
        details: `Laporan SOS Bullying dibuat: ${reportNo} - Korban: ${victimName} (${victimClass}), Kategori: ${category}, Tingkat: ${urgencyLevel}`
      }
    });

    return NextResponse.json({
      success: true,
      reportNo,
      message: 'Laporan SOS Bullying berhasil dikirim. Guru BK dan Tim TPPK akan segera menindaklanjuti secara rahasia dan aman.',
      report
    });
  } catch (error: any) {
    console.error('Error submitting SOS bullying report:', error);
    return NextResponse.json({ error: 'Gagal mengirim laporan SOS Bullying: ' + error.message }, { status: 500 });
  }
}

// PUT: Perbarui Status Investigasi & Penyelesaian (Khusus Guru BK / Admin)
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Guru BK dan Admin yang dapat memperbarui penanganan kasus' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, handledBy, actionPlan, resolutionNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID laporan wajib disertakan' }, { status: 400 });
    }

    const targetReport = await prisma.bullyingReport.findUnique({ where: { id } });
    if (!targetReport) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.bullyingReport.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        handledBy: handledBy || session.name,
        actionPlan: actionPlan !== undefined ? actionPlan : targetReport.actionPlan,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : targetReport.resolutionNotes
      }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'UPDATE_SOS_BULLYING',
        module: 'SOS Bullying',
        details: `Memperbarui status SOS Bullying ${targetReport.reportNo} menjadi "${status || targetReport.status}" (Ditangani oleh: ${handledBy || session.name})`
      }
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error: any) {
    console.error('Error updating SOS bullying report:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status penanganan' }, { status: 500 });
  }
}
