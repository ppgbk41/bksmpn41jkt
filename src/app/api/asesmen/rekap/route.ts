import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK', 'WALI_KELAS'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';
    const semester = searchParams.get('semester') || 'Ganjil';
    const levelStr = searchParams.get('level');
    const classId = searchParams.get('classId');
    const assessmentType = searchParams.get('assessmentType') || 'AKPD';

    let studentWhere: any = { status: 'Aktif' };
    if (classId) {
      studentWhere.currentClassId = classId;
    } else if (levelStr) {
      studentWhere.currentClass = { level: parseInt(levelStr) };
    }

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: { currentClass: true },
      orderBy: [{ currentClassId: 'asc' }, { name: 'asc' }]
    });

    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        assessmentType,
        academicYear,
        semester,
        student: studentWhere
      },
      include: {
        student: { select: { id: true, name: true, nisn: true, currentClass: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map student submission
    const studentMap: Record<string, any> = {};
    submissions.forEach(sub => {
      if (!studentMap[sub.studentId]) {
        studentMap[sub.studentId] = sub;
      }
    });

    const rekapData = students.map(s => {
      const sub = studentMap[s.id];
      let details: any = null;
      try {
        details = sub ? JSON.parse(sub.summaryJson || '{}') : null;
      } catch (e) {}

      return {
        studentId: s.id,
        studentName: s.name,
        nisn: s.nisn,
        className: s.currentClass?.name || '-',
        hasSubmitted: !!sub,
        submittedAt: sub ? sub.createdAt : null,
        dominantResult: sub ? sub.dominantResult : 'Belum Mengerjakan',
        score: sub ? sub.score : null,
        interpretation: sub ? sub.interpretation : '-',
        recommendations: sub ? sub.recommendations : '-',
        details
      };
    });

    const totalStudents = students.length;
    const completedCount = rekapData.filter(r => r.hasSubmitted).length;
    const pendingCount = totalStudents - completedCount;

    return NextResponse.json({
      academicYear,
      semester,
      assessmentType,
      totalStudents,
      completedCount,
      pendingCount,
      completionPercentage: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
      rekapData
    });
  } catch (error: any) {
    console.error('Error fetching assessment rekap:', error);
    return NextResponse.json({ error: 'Gagal mengambil rekapitulasi asesmen' }, { status: 500 });
  }
}
