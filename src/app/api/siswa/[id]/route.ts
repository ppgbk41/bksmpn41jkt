import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: true,
        classHistories: { orderBy: { academicYear: 'desc' } },
        assessmentResults: { orderBy: { date: 'desc' } },
        assessmentSubmissions: { orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { version: 'desc' }] },
        assessmentAlerts: { orderBy: { createdAt: 'desc' } },
        registrations: { orderBy: { createdAt: 'desc' } },
        sessions: { orderBy: { date: 'desc' } },
        followUps: { orderBy: { createdAt: 'desc' } },
        referrals: { orderBy: { date: 'desc' } }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Peserta didik tidak ditemukan' }, { status: 404 });
    }

    // Security Check: Role-Based Scoping
    if (session.role === 'MURID' && session.studentId !== student.id) {
      return NextResponse.json({ error: 'Anda hanya dapat mengakses profil milik Anda sendiri' }, { status: 403 });
    }

    if (session.role === 'WALI_KELAS' && session.activeClassId !== student.currentClassId) {
      return NextResponse.json({ error: 'Anda hanya dapat mengakses siswa di kelas diampu' }, { status: 403 });
    }

    // Confidentiality Filter: Redact counseling session details if Wali Kelas or Murid
    const canViewConfidential = ['ADMIN', 'GURU_BK'].includes(session.role);

    const sanitizedData = {
      ...student,
      sessions: canViewConfidential ? student.sessions : [], // Strictly hidden for Wali Kelas & Murid
      followUps: canViewConfidential ? student.followUps : student.followUps.map(f => ({
        id: f.id,
        type: f.type,
        scheduleDate: f.scheduleDate,
        status: f.status
      }))
    };

    // Log audit view if Guru BK views confidential notes
    if (canViewConfidential) {
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: 'VIEW_STUDENT_PROFILE',
          module: 'Peserta Didik',
          details: `Melihat profil terintegrasi & rekam jejak konseling: ${student.name} (${student.nisn})`
        }
      });
    }

    return NextResponse.json({ student: sanitizedData, canViewConfidential });
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const student = await prisma.student.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json({ success: true, student });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui data' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Administrator yang dapat menghapus data' }, { status: 403 });
    }

    await prisma.student.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}
