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
      return NextResponse.json({ error: 'Silakan login untuk menyukai postingan ini' }, { status: 401 });
    }

    const postId = params.id;

    // Handle dummy posts gracefully
    if (postId.startsWith('dummy-post-')) {
      return NextResponse.json({
        success: true,
        liked: true,
        message: 'Disukai'
      });
    }

    const existingLike = await prisma.bkWorkLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.id
        }
      }
    });

    let liked = false;

    if (existingLike) {
      // Remove like
      await prisma.bkWorkLike.delete({
        where: { id: existingLike.id }
      });
      await prisma.bkWorkPost.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });
      liked = false;
    } else {
      // Add like
      await prisma.bkWorkLike.create({
        data: {
          postId,
          userId: session.id
        }
      });
      await prisma.bkWorkPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });
      liked = true;
    }

    const updatedPost = await prisma.bkWorkPost.findUnique({
      where: { id: postId },
      select: { likesCount: true }
    });

    return NextResponse.json({
      success: true,
      liked,
      likesCount: updatedPost?.likesCount || 0
    });
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Gagal memproses suka: ' + error.message }, { status: 500 });
  }
}
