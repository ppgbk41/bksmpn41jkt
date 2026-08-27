import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        nipNis: true,
        phone: true,
        mustChangePassword: true,
        activeClassId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data akun' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, name, role, nipNis, phone, password, activeClassId } = body;

    if (!username || !password || !name || !role) {
      return NextResponse.json({ error: 'Username, password, nama, dan role wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        passwordHash,
        role,
        name,
        nipNis: nipNis || null,
        phone: phone || null,
        activeClassId: activeClassId || null,
        mustChangePassword: true
      }
    });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'CREATE_USER',
        module: 'Manajemen Pengguna',
        details: `Membuat akun pengguna baru: ${name} (${username}, Role: ${role})`
      }
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal membuat pengguna baru' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'ID pengguna wajib dispesifikasikan' }, { status: 400 });
    }

    if (userId === session.id) {
      return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    // Audit log
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        userRole: session.role,
        action: 'DELETE_USER',
        module: 'Manajemen Pengguna',
        details: `Menghapus akun pengguna: ${targetUser.name} (${targetUser.username}, Role: ${targetUser.role})`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengguna' }, { status: 500 });
  }
}
