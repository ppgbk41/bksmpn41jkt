import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Alasan pelaporan wajib diisi' }, { status: 400 });
    }

    if (!postId.startsWith('dummy-post-')) {
      await (prisma as any).bkWorkReport.create({
        data: {
          postId,
          reporterId: session.id,
          reporterName: session.name,
          reason: reason.trim()
        }
      });

      await (prisma as any).bkWorkPost.update({
        where: { id: postId },
        data: { reportsCount: { increment: 1 } }
      });
    }

    // Create notification for Guru BK
    try {
      await prisma.notification.create({
        data: {
          targetRole: 'GURU_BK',
          title: `🚩 LAPORAN KONTEN KARYA BK`,
          message: `Postingan karya dilaporkan oleh ${session.name}. Alasan: "${reason.trim().slice(0, 80)}"`,
          type: 'URGENT',
          link: '/karya-bk'
        }
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Terima kasih. Laporan Anda telah diterima dan akan ditinjau oleh Guru BK demi keamanan bersama. 🛡️'
    });
  } catch (error: any) {
    console.error('Error reporting post:', error);
    return NextResponse.json({ error: 'Gagal mengiriim laporan: ' + error.message }, { status: 500 });
  }
}
