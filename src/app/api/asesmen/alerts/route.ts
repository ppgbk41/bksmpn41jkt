import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET: Fetch assessment alerts with filters
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const classId = searchParams.get('classId');

    let whereClause: any = {};
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (classId) whereClause.student = { currentClassId: classId };

    const alerts = await prisma.assessmentAlert.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, name: true, nisn: true, phone: true, parentPhone: true, currentClass: { select: { name: true } } }
        },
        submission: true
      },
      orderBy: [
        { severity: 'asc' }, // high, medium, monitoring
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching assessment alerts:', error);
    return NextResponse.json({ error: 'Gagal mengambil alert asesmen' }, { status: 500 });
  }
}

// PATCH: Update alert status or notes
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { alertId, status, notes } = body;

    if (!alertId || !status) {
      return NextResponse.json({ error: 'Alert ID dan status wajib diisi' }, { status: 400 });
    }

    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = session.name;
    }

    const updated = await prisma.assessmentAlert.update({
      where: { id: alertId },
      data: updateData,
      include: { student: { select: { name: true } } }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id || 'system',
        userName: session.name,
        userRole: session.role,
        action: 'UPDATE_ASSESSMENT_ALERT_STATUS',
        module: 'Asesmen',
        details: `Mengubah status alert asesmen ${updated.student?.name} menjadi ${status}`
      }
    });

    return NextResponse.json({ success: true, alert: updated });
  } catch (error: any) {
    console.error('Error updating alert status:', error);
    return NextResponse.json({ error: 'Gagal meng-update alert status' }, { status: 500 });
  }
}
