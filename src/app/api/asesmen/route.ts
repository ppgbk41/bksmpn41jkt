import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let whereClause: any = {};
    if (studentId) {
      whereClause.studentId = studentId;
    }

    const results = await prisma.assessmentResult.findMany({
      where: whereClause,
      include: {
        student: {
          select: { name: true, nisn: true, currentClass: { select: { name: true } } }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data asesmen' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, assessmentName, date, score, category, interpretation, attentionAreas, recommendations } = body;

    if (!studentId || !assessmentName || !date) {
      return NextResponse.json({ error: 'Data asesmen belum lengkap' }, { status: 400 });
    }

    const newResult = await prisma.assessmentResult.create({
      data: {
        studentId,
        assessmentName,
        date,
        academicYear: '2025/2026',
        score: score ? parseFloat(score) : null,
        category: category || 'Sedang',
        interpretation: interpretation || '',
        attentionAreas: attentionAreas || '',
        recommendations: recommendations || '',
        bkTeacherName: session.name
      }
    });

    return NextResponse.json({ success: true, result: newResult });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menyimpan hasil asesmen' }, { status: 500 });
  }
}
