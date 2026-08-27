import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let whereClause: any = {};
    if (session.role === 'WALI_KELAS') {
      whereClause.homeroomTeacherName = { contains: session.name };
    }

    const referrals = await prisma.teacherReferral.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, nisn: true, currentClass: { select: { name: true } } } }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ referrals });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data rujukan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'WALI_KELAS', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, reason, observedCondition, actionsTaken, priority, notes } = body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { currentClass: true }
    });

    if (!student) {
      return NextResponse.json({ error: 'Peserta didik tidak ditemukan' }, { status: 404 });
    }

    const referral = await prisma.teacherReferral.create({
      data: {
        studentId,
        studentName: student.name,
        className: student.currentClass.name,
        homeroomTeacherName: session.name,
        date: new Date().toISOString().split('T')[0],
        reason,
        observedCondition,
        actionsTaken: actionsTaken || 'Pendampingan wali kelas',
        priority: priority || 'Normal',
        notes: notes || '',
        status: 'Baru'
      }
    });

    // Send Notification to Guru BK
    await prisma.notification.create({
      data: {
        targetRole: 'GURU_BK',
        title: `Rujukan Baru dari Wali Kelas (${session.name})`,
        message: `Rujukan murid ${student.name} (${student.currentClass.name}) dengan prioritas ${priority || 'Normal'}.`,
        type: 'REFERRAL',
        link: '/layanan/rujukan'
      }
    });

    return NextResponse.json({ success: true, referral });
  } catch (error: any) {
    console.error('Error creating referral:', error);
    return NextResponse.json({ error: 'Gagal membuat rujukan' }, { status: 500 });
  }
}
