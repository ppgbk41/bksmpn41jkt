import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const followUps = await prisma.counselingFollowUp.findMany({
      include: {
        student: {
          select: { name: true, nisn: true, currentClass: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ followUps });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data tindak lanjut' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, sessionId, type, scheduleDate, involvedParties, monitoringResult, conditionChange, nextRecommendations } = body;

    const followUp = await prisma.counselingFollowUp.create({
      data: {
        studentId,
        sessionId: sessionId || null,
        type,
        scheduleDate,
        involvedParties,
        monitoringResult: monitoringResult || '',
        conditionChange: conditionChange || '',
        nextRecommendations: nextRecommendations || '',
        status: 'Dalam Proses'
      }
    });

    return NextResponse.json({ success: true, followUp });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menambah tindak lanjut' }, { status: 500 });
  }
}
