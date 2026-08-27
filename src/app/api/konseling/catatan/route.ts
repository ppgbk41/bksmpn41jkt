import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Catatan konseling individu bersifat rahasia.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let whereClause: any = {};
    if (studentId) whereClause.studentId = studentId;

    const sessions = await prisma.counselingSession.findMany({
      where: whereClause,
      include: {
        student: {
          select: { name: true, nisn: true, currentClass: { select: { name: true } } }
        },
        followUps: true
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil catatan konseling' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Akses Ditolak: Hanya Guru BK dan Administrator yang dapat menginput catatan konseling.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      studentId,
      date,
      time,
      location,
      referralSource,
      issueCategory,
      issueDescription,
      issueIdentification,
      goals,
      techniques,
      counselingProcess,
      outcome,
      agreement,
      followUpPlan,
      nextMeetingDate,
      status,
      confidentialityLevel
    } = body;

    if (!studentId || !date || !issueCategory || !issueDescription) {
      return NextResponse.json({ error: 'Data catatan konseling belum lengkap' }, { status: 400 });
    }

    // Determine session number for student
    const existingCount = await prisma.counselingSession.count({ where: { studentId } });

    const newSession = await prisma.counselingSession.create({
      data: {
        sessionNo: existingCount + 1,
        studentId,
        date,
        time: time || '09:00 WIB',
        location: location || 'Ruang BK',
        bkTeacherName: session.name,
        referralSource: referralSource || 'Mandiri',
        issueCategory,
        issueDescription,
        issueIdentification: issueIdentification || '',
        goals: goals || '',
        techniques: techniques || '',
        counselingProcess: counselingProcess || '',
        outcome: outcome || '',
        agreement: agreement || '',
        followUpPlan: followUpPlan || '',
        nextMeetingDate: nextMeetingDate || null,
        status: status || 'Selesai',
        confidentialityLevel: confidentialityLevel || 'CONFIDENTIAL'
      }
    });

    // Log audit trail for creating confidential notes
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'CREATE_CONFIDENTIAL_SESSION',
        module: 'Catatan Konseling',
        details: `Membuat Catatan Konseling Rahasia Sesi #${newSession.sessionNo} untuk Student ID: ${studentId}`
      }
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (error: any) {
    console.error('Error creating counseling session note:', error);
    return NextResponse.json({ error: 'Gagal membuat catatan konseling' }, { status: 500 });
  }
}
