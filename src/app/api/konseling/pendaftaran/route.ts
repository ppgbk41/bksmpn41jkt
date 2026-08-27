import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendBkRegistrationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let whereClause: any = {};
    if (session.role === 'MURID' && session.studentId) {
      whereClause.studentId = session.studentId;
    }

    if (status) {
      whereClause.status = status;
    }

    const registrations = await prisma.counselingRegistration.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, name: true, nisn: true, currentClass: { select: { name: true } } }
        },
        schedules: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ registrations });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data pendaftaran' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, nisn, bkTeacherName, issueCategory, reason, description, urgencyLevel, preferredDate, preferredTime, mode } = body;

    if ((!studentId && !nisn) || !issueCategory || !description || !preferredDate) {
      return NextResponse.json({ error: 'Mohon lengkapi seluruh formulir pendaftaran' }, { status: 400 });
    }

    // Find student by studentId or NISN/NIS
    let student = null;
    if (studentId) {
      student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { currentClass: true }
      });
    } else if (nisn) {
      student = await prisma.student.findFirst({
        where: { OR: [{ nisn }, { nis: nisn }] },
        include: { currentClass: true }
      });
    }

    if (!student) {
      return NextResponse.json({ error: 'Data peserta didik tidak ditemukan di database sekolah' }, { status: 404 });
    }

    const regCount = await prisma.counselingRegistration.count();
    const registrationNo = `REG-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(regCount + 1).padStart(3, '0')}`;

    const registration = await prisma.counselingRegistration.create({
      data: {
        registrationNo,
        studentId: student.id,
        studentName: student.name,
        className: student.currentClass.name,
        phone: student.phone,
        bkTeacherName: bkTeacherName || 'Dra. Hj. Siti Aminah, M.Pd.',
        issueCategory,
        reason: reason || '',
        description,
        urgencyLevel: urgencyLevel || 'Tidak mendesak',
        preferredDate,
        preferredTime: preferredTime || '09:00 WIB',
        mode: mode || 'Tatap Muka',
        privacyAgreed: true,
        status: 'Baru'
      }
    });

    // 1. Create In-App Notification for Guru BK
    await prisma.notification.create({
      data: {
        targetRole: 'GURU_BK',
        title: urgencyLevel?.includes('Mendesak') ? '🚨 Pendaftaran Konseling MENDESAK!' : 'Pendaftaran Konseling Baru',
        message: `${student.name} (${student.currentClass.name}) mendaftar konseling kategori ${issueCategory}. Email notifikasi dikirim ke bksmpn41jkt@gmail.com.`,
        type: urgencyLevel?.includes('Mendesak') ? 'URGENT' : 'REGISTRATION',
        link: '/layanan/konseling'
      }
    });

    // 2. Send Direct Email Notification to bksmpn41jkt@gmail.com
    try {
      await sendBkRegistrationEmail({
        registrationNo,
        studentName: student.name,
        nisn: student.nisn,
        className: student.currentClass.name,
        bkTeacherName,
        issueCategory,
        reason,
        description,
        urgencyLevel: urgencyLevel || 'Tidak mendesak',
        preferredDate,
        preferredTime: preferredTime || '09:00 WIB',
        mode: mode || 'Tatap Muka',
        phone: student.phone || ''
      });
    } catch (emailErr) {
      console.error('Email dispatch non-blocking error:', emailErr);
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    console.error('Error registering counseling:', error);
    return NextResponse.json({ error: 'Gagal membuat pendaftaran konseling' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, date, timeSlot, location, notes } = body;

    const registration = await prisma.counselingRegistration.update({
      where: { id },
      data: { status }
    });

    // If status is "Sudah Dijadwalkan", create a schedule
    if (status === 'Sudah Dijadwalkan' && date) {
      await prisma.counselingSchedule.create({
        data: {
          registrationId: id,
          studentId: registration.studentId,
          studentName: registration.studentName,
          className: registration.className,
          bkTeacherName: session.name,
          date,
          timeSlot: timeSlot || '09:00 - 09:45 WIB',
          mode: registration.mode,
          location: location || 'Ruang BK',
          status: 'Terjadwal',
          notes
        }
      });

      // Send notification to student
      await prisma.notification.create({
        data: {
          userId: registration.studentId,
          title: 'Jadwal Konseling Disetujui',
          message: `Permohonan konseling Anda disetujui untuk tanggal ${date} jam ${timeSlot || '09:00 WIB'} di ${location || 'Ruang BK'}.`,
          type: 'SCHEDULE',
          link: '/murid/portal'
        }
      });
    }

    return NextResponse.json({ success: true, registration });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui status pendaftaran' }, { status: 500 });
  }
}
