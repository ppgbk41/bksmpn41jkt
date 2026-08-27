import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password, roleHint } = body; // identifier can be email, username, or nisn

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/Email/NISN dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Search user by username, email, or nipNis
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { nipNis: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan atau kredensial salah' },
        { status: 401 }
      );
    }

    // Check role restriction if roleHint is provided
    if (roleHint && roleHint !== user.role) {
      if (roleHint === 'MURID' && user.role !== 'MURID') {
        return NextResponse.json(
          { error: 'Portal murid hanya dapat diakses oleh akun Peserta Didik' },
          { status: 403 }
        );
      }
      if (roleHint === 'ADMIN' && user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Halaman ini khusus untuk Administrator' },
          { status: 403 }
        );
      }
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Kata sandi tidak sesuai' },
        { status: 401 }
      );
    }

    // Create session token
    const token = createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as any,
      nipNis: user.nipNis,
      activeClassId: user.activeClassId,
      studentId: user.studentId,
      mustChangePassword: user.mustChangePassword
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'LOGIN',
        module: 'Autentikasi',
        details: `User ${user.name} (${user.role}) berhasil masuk ke sistem.`
      }
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    });

    response.cookies.set('bk_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
