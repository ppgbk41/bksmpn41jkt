import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ notifications: [] });

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId: session.id },
          { targetRole: session.role },
          { targetRole: 'ALL' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ notifications: [] });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: {
          OR: [
            { userId: session.id },
            { targetRole: session.role },
            { targetRole: 'ALL' }
          ]
        },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Gagal memperbarui notifikasi' }, { status: 500 });
  }
}
