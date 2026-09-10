import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get('academicYear') || '2025/2026';
    const semester = searchParams.get('semester') || 'Ganjil';
    const levelStr = searchParams.get('level');
    const classId = searchParams.get('classId');

    // Build filter for students
    let studentWhere: any = { status: 'Aktif' };
    if (classId) {
      studentWhere.currentClassId = classId;
    } else if (levelStr) {
      studentWhere.currentClass = { level: parseInt(levelStr) };
    }

    const totalStudents = await prisma.student.count({ where: studentWhere });

    // Fetch classes for filter dropdown
    const classes = await prisma.class.findMany({
      orderBy: [{ level: 'asc' }, { section: 'asc' }]
    });

    // Fetch submissions matching academic year and semester
    const submissions = await prisma.assessmentSubmission.findMany({
      where: {
        academicYear,
        semester,
        student: studentWhere
      },
      include: {
        student: {
          select: { id: true, name: true, nisn: true, currentClass: { select: { id: true, name: true, level: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Student completion mapping
    const studentSubmissionMap: Record<string, Set<string>> = {}; // studentId -> Set of assessmentTypes
    submissions.forEach(sub => {
      if (!studentSubmissionMap[sub.studentId]) {
        studentSubmissionMap[sub.studentId] = new Set();
      }
      studentSubmissionMap[sub.studentId].add(sub.assessmentType);
    });

    const studentIdsCompleted = Object.keys(studentSubmissionMap).filter(sId => studentSubmissionMap[sId].size >= 1);
    const totalCompletedStudents = studentIdsCompleted.length;
    const totalNotCompletedStudents = Math.max(0, totalStudents - totalCompletedStudents);

    // Count completions per assessment type
    const akpdCompletedCount = submissions.filter(s => s.assessmentType === 'AKPD').length;
    const riasecCompletedCount = submissions.filter(s => s.assessmentType === 'RIASEC').length;
    const sosiometriCompletedCount = submissions.filter(s => s.assessmentType === 'SOSIOMETRI').length;
    const gayaBelajarCompletedCount = submissions.filter(s => s.assessmentType === 'GAYA_BELAJAR').length;
    const minatBakatCompletedCount = submissions.filter(s => s.assessmentType === 'MINAT_BAKAT').length;

    // Fetch active alerts
    const alerts = await prisma.assessmentAlert.findMany({
      where: {
        student: studentWhere,
        status: { in: ['new', 'viewed', 'follow_up'] }
      },
      include: {
        student: {
          select: { id: true, name: true, nisn: true, currentClass: { select: { name: true } } }
        }
      },
      orderBy: [
        { severity: 'asc' }, // high first
        { createdAt: 'desc' }
      ]
    });

    const totalAlerts = alerts.length;

    return NextResponse.json({
      filters: { academicYear, semester, level: levelStr, classId },
      classes,
      metrics: {
        totalStudents,
        totalCompletedStudents,
        totalNotCompletedStudents,
        totalAlerts,
        completionStats: {
          AKPD: { completed: akpdCompletedCount, total: totalStudents, pct: totalStudents > 0 ? Math.round((akpdCompletedCount / totalStudents) * 100) : 0 },
          RIASEC: { completed: riasecCompletedCount, total: totalStudents, pct: totalStudents > 0 ? Math.round((riasecCompletedCount / totalStudents) * 100) : 0 },
          SOSIOMETRI: { completed: sosiometriCompletedCount, total: totalStudents, pct: totalStudents > 0 ? Math.round((sosiometriCompletedCount / totalStudents) * 100) : 0 },
          GAYA_BELAJAR: { completed: gayaBelajarCompletedCount, total: totalStudents, pct: totalStudents > 0 ? Math.round((gayaBelajarCompletedCount / totalStudents) * 100) : 0 },
          MINAT_BAKAT: { completed: minatBakatCompletedCount, total: totalStudents, pct: totalStudents > 0 ? Math.round((minatBakatCompletedCount / totalStudents) * 100) : 0 }
        }
      },
      alerts,
      submissions
    });
  } catch (error: any) {
    console.error('Error fetching assessment dashboard:', error);
    return NextResponse.json({ error: 'Gagal memuat dashboard asesmen' }, { status: 500 });
  }
}
