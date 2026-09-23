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
      return NextResponse.json({ error: 'Silakan login untuk memberikan komentar' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Komentar tidak boleh kosong' }, { status: 400 });
    }

    // Determine user label/class
    let userClass = 'Siswa';
    if (session.role === 'GURU_BK') userClass = 'Guru BK';
    else if (session.role === 'WALI_KELAS') userClass = 'Wali Kelas';
    else if (session.role === 'ADMIN') userClass = 'Admin';
    else if (session.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: session.studentId },
        include: { currentClass: true }
      });
      if (student) {
        userClass = `Kelas ${student.currentClass?.name || 'SMPN 41'}`;
      }
    }

    // Handle dummy posts gracefully in database or fallback
    if (postId.startsWith('dummy-post-')) {
      const newComment = {
        id: `dummy-c-${Date.now()}`,
        postId,
        userId: session.id,
        userName: session.name,
        userClass,
        userAvatar: null,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      return NextResponse.json({
        success: true,
        comment: newComment,
        message: 'Komentar berhasil ditambahkan'
      });
    }

    const comment = await (prisma as any).bkWorkComment.create({
      data: {
        postId,
        userId: session.id,
        userName: session.name,
        userClass,
        userAvatar: null,
        content: content.trim()
      }
    });

    await (prisma as any).bkWorkPost.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      comment,
      message: 'Komentar berhasil ditambahkan'
    });
  } catch (error: any) {
    console.error('Error posting comment:', error);
    return NextResponse.json({ error: 'Gagal menambahkan komentar: ' + error.message }, { status: 500 });
  }
}
