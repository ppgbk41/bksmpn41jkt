import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role-based filters
    let studentWhere: any = {};
    let sosWhere: any = {
      status: { in: ['BARU', 'INVESTIGASI', 'MEDIASI', 'DIRUJUK_TPPK'] }
    };

    if (session.role === 'WALI_KELAS' && session.activeClassId) {
      studentWhere.currentClassId = session.activeClassId;
      const homeroomClass = await prisma.class.findUnique({ where: { id: session.activeClassId } });
      if (homeroomClass) {
        sosWhere.victimClass = homeroomClass.name;
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Execute ALL dashboard queries concurrently via Promise.all
    const [
      activeSosReports,
      totalStudents,
      grade7Count,
      grade8Count,
      grade9Count,
      studentsWithAssessment,
      newRegistrationsCount,
      scheduledCounselingCount,
      completedCounselingCount,
      followUpRequiredCount,
      todaySchedules,
      sessions,
      recentActivities
    ] = await Promise.all([
      // 1. Active SOS Bullying Reports
      prisma.bullyingReport.findMany({
        where: sosWhere,
        orderBy: [{ urgencyLevel: 'desc' }, { createdAt: 'desc' }],
        take: 5
      }),
      // 2. Total Students
      prisma.student.count({ where: studentWhere }),
      // 3. Grade 7
      prisma.student.count({ where: { ...studentWhere, currentClass: { level: 7 } } }),
      // 4. Grade 8
      prisma.student.count({ where: { ...studentWhere, currentClass: { level: 8 } } }),
      // 5. Grade 9
      prisma.student.count({ where: { ...studentWhere, currentClass: { level: 9 } } }),
      // 6. With Assessment
      prisma.student.count({ where: { ...studentWhere, assessmentResults: { some: {} } } }),
      // 7. New Registrations
      prisma.counselingRegistration.count({ where: { status: 'Baru' } }),
      // 8. Scheduled
      prisma.counselingSchedule.count({ where: { status: 'Terjadwal' } }),
      // 9. Completed
      prisma.counselingSession.count({ where: { status: 'Selesai' } }),
      // 10. Follow up required
      prisma.counselingFollowUp.count({ where: { status: 'Dalam Proses' } }),
      // 11. Today's schedules
      prisma.counselingSchedule.findMany({
        where: { date: todayStr },
        include: { registration: true },
        orderBy: { timeSlot: 'asc' }
      }),
      // 12. Problem categories
      prisma.counselingSession.findMany({
        select: { issueCategory: true }
      }),
      // 13. Recent activities
      prisma.activityLog.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const urgentSosCount = activeSosReports.filter(r => r.urgencyLevel === 'DARURAT').length;
    const studentsWithoutAssessment = Math.max(0, totalStudents - studentsWithAssessment);

    // Problem Categories Aggregation
    const categoryCounts: Record<string, number> = {
      'Pribadi': 0,
      'Sosial': 0,
      'Belajar': 0,
      'Karier': 0,
      'Keluarga': 0,
      'Perundungan': 0,
      'Kedisiplinan': 0,
      'Kehadiran': 0
    };

    sessions.forEach(s => {
      if (categoryCounts[s.issueCategory] !== undefined) {
        categoryCounts[s.issueCategory]++;
      } else {
        categoryCounts[s.issueCategory] = 1;
      }
    });

    const problemChartData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Monthly Chart Data
    const monthlyChartData = [
      { month: 'Jan', jumlah: 12 },
      { month: 'Feb', jumlah: 19 },
      { month: 'Mar', jumlah: 15 },
      { month: 'Apr', jumlah: 22 },
      { month: 'Mei', jumlah: 18 },
      { month: 'Jun', jumlah: 10 },
      { month: 'Jul', jumlah: 25 },
      { month: 'Agu', jumlah: 31 }
    ];

    return NextResponse.json({
      stats: {
        totalStudents,
        grade7Count,
        grade8Count,
        grade9Count,
        studentsWithAssessment,
        studentsWithoutAssessment,
        newRegistrationsCount,
        scheduledCounselingCount,
        completedCounselingCount,
        followUpRequiredCount,
        urgentSosCount,
        activeSosCount: activeSosReports.length
      },
      activeSosReports,
      todaySchedules,
      problemChartData,
      monthlyChartData,
      recentActivities
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Gagal mengambil statistik dashboard' }, { status: 500 });
  }
}
