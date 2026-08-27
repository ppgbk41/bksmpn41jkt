import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level');
    const className = searchParams.get('className');
    const gender = searchParams.get('gender');

    let whereClause: any = {};

    // Role-based scoping: Wali Kelas can ONLY view students in their assigned class
    if (session.role === 'WALI_KELAS' && session.activeClassId) {
      whereClause.currentClassId = session.activeClassId;
    } else {
      if (className) {
        whereClause.currentClass = { name: className };
      } else if (level) {
        whereClause.currentClass = { level: parseInt(level) };
      }
    }

    if (gender) {
      whereClause.gender = gender;
    }

    if (search) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        {
          OR: [
            { name: { contains: search } },
            { nis: { contains: search } },
            { nisn: { contains: search } }
          ]
        }
      ];
    }

    // High performance select with SQL count aggregation
    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        nis: true,
        nisn: true,
        name: true,
        gender: true,
        photoUrl: true,
        currentClassId: true,
        currentClass: {
          select: { name: true, level: true }
        },
        _count: {
          select: {
            assessmentResults: true,
            sessions: true,
            followUps: { where: { status: 'Dalam Proses' } }
          }
        }
      },
      orderBy: [
        { currentClass: { name: 'asc' } },
        { name: 'asc' }
      ]
    });

    const sanitized = students.map((s) => ({
      id: s.id,
      nis: s.nis,
      nisn: s.nisn,
      name: s.name,
      gender: s.gender,
      currentClass: s.currentClass.name,
      currentClassId: s.currentClassId,
      assessmentCount: s._count.assessmentResults,
      assessmentStatus: s._count.assessmentResults > 0 ? 'Sudah Asesmen' : 'Belum Asesmen',
      counselingCount: s._count.sessions,
      hasPendingFollowUp: s._count.followUps > 0,
      photoUrl: s.photoUrl
    }));

    return NextResponse.json({ students: sanitized });
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin dan Guru BK' }, { status: 403 });
    }

    const body = await request.json();
    const {
      nis,
      nisn,
      name,
      gender,
      currentClassId,
      birthPlace,
      birthDate,
      religion,
      address,
      phone,
      email,
      fatherName,
      motherName,
      guardianName,
      parentPhone,
      parentJob,
      notes,
      photoUrl
    } = body;

    if (!nis || !nisn || !name || !gender || !currentClassId) {
      return NextResponse.json({ error: 'NIS, NISN, Nama, Gender, dan Kelas wajib diisi' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        nis,
        nisn,
        name,
        gender,
        currentClassId,
        birthPlace,
        birthDate,
        religion,
        address,
        phone,
        email,
        fatherName,
        motherName,
        guardianName,
        parentPhone,
        parentJob,
        notes,
        photoUrl
      }
    });

    // Auto-create student login user account with format bk + 3 random digits
    const randomUserDigits = Math.floor(100 + Math.random() * 900);
    const randomPassDigits = Math.floor(100 + Math.random() * 900);
    const studentUsername = `bk${randomUserDigits}`;
    const studentPassword = `bk${randomPassDigits}`;
    const passwordHash = await bcrypt.hash(studentPassword, 10);

    await prisma.user.create({
      data: {
        username: studentUsername,
        email: email || `${nis}@siswa.smp41jkt.sch.id`,
        passwordHash,
        role: 'MURID',
        name,
        nipNis: nis,
        studentId: student.id,
        mustChangePassword: false
      }
    });

    return NextResponse.json({
      success: true,
      student,
      credentials: {
        username: studentUsername,
        password: studentPassword
      }
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Gagal membuat data murid: ' + error.message }, { status: 500 });
  }
}
