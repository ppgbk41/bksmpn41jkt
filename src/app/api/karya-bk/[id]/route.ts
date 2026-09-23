import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// DELETE: Hapus postingan (Pemilik postingan ATAU Guru BK / Admin)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sesi telah berakhir. Silakan login kembali' }, { status: 401 });
    }

    const postId = params.id;

    if (postId.startsWith('dummy-post-')) {
      return NextResponse.json({
        success: true,
        message: 'Postingan berhasil dihapus'
      });
    }

    const post = await prisma.bkWorkPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Postingan tidak ditemukan' }, { status: 404 });
    }

    const isOwner = post.userId === session.id;
    const isStaff = ['ADMIN', 'GURU_BK'].includes(session.role);

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: 'Anda tidak memiliki hak akses untuk menghapus postingan ini' }, { status: 403 });
    }

    await prisma.bkWorkPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      success: true,
      message: 'Postingan karya berhasil dihapus'
    });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Gagal menghapus postingan: ' + error.message }, { status: 500 });
  }
}

// PATCH: Moderasi postingan (Sembunyikan/Publikasikan) oleh Guru BK / Admin
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'GURU_BK'].includes(session.role)) {
      return NextResponse.json({ error: 'Akses moderasi khusus Guru BK dan Admin' }, { status: 403 });
    }

    const postId = params.id;
    const body = await request.json();
    const { status } = body; // 'published' or 'hidden'

    if (!['published', 'hidden', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Status moderasi tidak valid' }, { status: 400 });
    }

    if (!postId.startsWith('dummy-post-')) {
      await prisma.bkWorkPost.update({
        where: { id: postId },
        data: { status }
      });
    }

    return NextResponse.json({
      success: true,
      message: status === 'hidden' ? 'Postingan berhasil disembunyikan' : 'Postingan berhasil dipublikasikan kembali'
    });
  } catch (error: any) {
    console.error('Error updating post status:', error);
    return NextResponse.json({ error: 'Gagal mengubah status postingan: ' + error.message }, { status: 500 });
  }
}
