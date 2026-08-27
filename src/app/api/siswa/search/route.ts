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
    const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
    const className = (searchParams.get('className') || '').trim().toUpperCase();
    const level = searchParams.get('level');

    let whereClause: any = {
      status: 'Aktif'
    };

    // Role scoping: Wali Kelas hanya bisa memilih siswa di kelasnya jika ada activeClassId
    if (session.role === 'WALI_KELAS' && session.activeClassId) {
      whereClause.currentClassId = session.activeClassId;
    } else {
      if (className && className !== 'ALL') {
        whereClause.currentClass = { name: className };
      } else if (level && level !== 'ALL') {
        whereClause.currentClass = { level: parseInt(level) };
      }
    }

    if (query) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { name: { contains: query } },
            { nis: { contains: query } },
            { nisn: { contains: query } },
            { currentClass: { name: { contains: query } } }
          ]
        }
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        nis: true,
        nisn: true,
        name: true,
        gender: true,
        phone: true,
        photoUrl: true,
        currentClassId: true,
        currentClass: {
          select: {
            id: true,
            name: true,
            level: true,
            section: true,
            teacherName: true
          }
        }
      },
      orderBy: [
        { currentClass: { name: 'asc' } },
        { name: 'asc' }
      ],
      take: 30
    });

    const formatted = students.map(s => ({
      id: s.id,
      nis: s.nis,
      nisn: s.nisn,
      name: s.name,
      gender: s.gender,
      phone: s.phone,
      photoUrl: s.photoUrl,
      className: s.currentClass?.name || '-',
      classLevel: s.currentClass?.level,
      homeroomTeacher: s.currentClass?.teacherName
    }));

    return NextResponse.json({ students: formatted });
  } catch (error: any) {
    console.error('Error searching students:', error);
    return NextResponse.json({ error: 'Gagal mencari data siswa' }, { status: 500 });
  }
}
