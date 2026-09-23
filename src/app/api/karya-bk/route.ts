import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Seed Initial Dummy Posts if DB is empty
const INITIAL_DUMMY_POSTS = [
  {
    id: 'dummy-post-1',
    userId: 'dummy-user-1',
    studentId: 'std-1',
    studentName: 'Aisyah Putri',
    studentClass: 'VIII A',
    userRole: 'MURID',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1000',
    caption: 'Hari ini saya menyelesaikan Lembar Kerja Peserta Didik (LKPD) "Mengenali Emosi & Potensi Diri". Saya jadi lebih memahami bagaimana cara mengelola emosi ketika menghadapi masalah. Terima kasih Ibu Guru BK! 😊🌟✨',
    category: 'LKPD',
    status: 'published',
    likesCount: 18,
    commentsCount: 3,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
    likes: [],
    comments: [
      {
        id: 'c1',
        postId: 'dummy-post-1',
        userId: 'dummy-user-2',
        userName: 'Budi Pratama',
        userClass: 'VII B',
        userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        content: 'Keren banget refleksinya Syah! Semangat terus ya! 👍🎉',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString()
      },
      {
        id: 'c2',
        postId: 'dummy-post-1',
        userId: 'guru-bk-1',
        userName: 'Ibu Rahmawati, S.Pd (Guru BK)',
        userClass: 'Guru BK',
        userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        content: 'Hebat sekali Aisyah! Pemahaman emosimu sudah sangat baik. Pertahankan ya nak! 🥰📚',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
      }
    ]
  },
  {
    id: 'dummy-post-2',
    userId: 'dummy-user-2',
    studentId: 'std-2',
    studentName: 'Budi Pratama',
    studentClass: 'VII B',
    userRole: 'MURID',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1000',
    caption: 'Poster "Stop Perundungan! Together We Stand for Safe School" hasil karya kelompok kami pada jam Bimbingan Klasikal BK minggu ini. Sekolah aman, belajar nyaman! 🎨💪✨',
    category: 'Karya',
    status: 'published',
    likesCount: 24,
    commentsCount: 2,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    likes: [],
    comments: [
      {
        id: 'c3',
        postId: 'dummy-post-2',
        userId: 'dummy-user-3',
        userName: 'Citra Dewi',
        userClass: 'IX C',
        userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
        content: 'Posternya bagus dan inspiratif banget! Katakan TIDAK pada Bullying! 🙌❤️',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      }
    ]
  },
  {
    id: 'dummy-post-3',
    userId: 'dummy-user-3',
    studentId: 'std-3',
    studentName: 'Citra Dewi',
    studentClass: 'IX C',
    userRole: 'MURID',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000',
    caption: 'Tugas Refleksi Diri setelah mengikuti Konseling Kelompok topik Manajemen Waktu Belajar. Ternyata membuat jadwal harian & skala prioritas membantu mengurangi kecemasan ujian sekolah! 📚📝💡',
    category: 'Refleksi',
    status: 'published',
    likesCount: 15,
    commentsCount: 1,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    likes: [],
    comments: []
  },
  {
    id: 'dummy-post-4',
    userId: 'dummy-user-4',
    studentId: 'std-4',
    studentName: 'Dion Prasetyo',
    studentClass: 'VIII C',
    userRole: 'MURID',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1000',
    caption: 'Hasil Mind Mapping "Perencanaan Karier & Cita-Cita Masa Depan" di Ruang BK. Saya bercita-cita menjadi Software Engineer dan membantu sesama melalui teknologi! 🚀💻🌟',
    category: 'Aktivitas BK',
    status: 'published',
    likesCount: 29,
    commentsCount: 4,
    reportsCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    likes: [],
    comments: []
  }
];

export async function GET(request: Request) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build Prisma query
    let where: any = {
      status: session && ['ADMIN', 'GURU_BK'].includes(session.role)
        ? { in: ['published', 'pending', 'hidden'] }
        : 'published'
    };

    if (category && category !== 'Semua') {
      where.category = category;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { studentName: { contains: search } },
        { caption: { contains: search } },
        { studentClass: { contains: search } }
      ];
    }

    let posts: any[] = [];
    try {
      posts = await (prisma as any).bkWorkPost.findMany({
        where,
        include: {
          likes: session ? { where: { userId: session.id } } : false,
          comments: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (e) {
      console.warn('DB table might be empty or syncing, falling back to query check', e);
    }

    // If database has no posts or lower count, merge/provide initial dummy posts so timeline is populated
    if (posts.length === 0) {
      let filteredDummy = INITIAL_DUMMY_POSTS;
      if (category && category !== 'Semua') {
        filteredDummy = filteredDummy.filter(p => p.category === category);
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase();
        filteredDummy = filteredDummy.filter(p =>
          p.studentName.toLowerCase().includes(q) ||
          p.caption.toLowerCase().includes(q) ||
          p.studentClass.toLowerCase().includes(q)
        );
      }
      posts = filteredDummy.map(p => ({
        ...p,
        userLiked: false
      }));
    } else {
      // Map userLiked flag
      posts = posts.map(post => ({
        ...post,
        userLiked: session ? Boolean(post.likes && post.likes.length > 0) : false
      }));
    }

    return NextResponse.json({
      success: true,
      posts,
      currentUser: session
        ? {
            id: session.id,
            name: session.name,
            role: session.role,
            studentId: session.studentId,
            nipNis: session.nipNis,
            username: session.username
          }
        : null
    });
  } catch (error: any) {
    console.error('Error fetching BK karya posts:', error);
    return NextResponse.json({ error: 'Gagal mengambil data Karya BK Siswa' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Sesi telah berakhir. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, caption, category = 'Karya', studentClass: inputClass } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Foto karya wajib diunggah' }, { status: 400 });
    }

    if (!caption || caption.trim() === '') {
      return NextResponse.json({ error: 'Caption / cerita karya tidak boleh kosong' }, { status: 400 });
    }

    // Resolve student class and avatar
    let studentClass = inputClass || 'Siswa SMPN 41';
    let avatarUrl = null;

    if (session.studentId) {
      const student = await prisma.student.findUnique({
        where: { id: session.studentId },
        include: { currentClass: true }
      });
      if (student) {
        studentClass = `Kelas ${student.currentClass?.name || 'SMPN 41'}`;
        avatarUrl = student.photoUrl || null;
      }
    } else if (session.role === 'MURID') {
      studentClass = 'Siswa SMPN 41';
    } else if (session.role === 'GURU_BK') {
      studentClass = 'Guru BK';
    } else if (session.role === 'WALI_KELAS') {
      studentClass = 'Wali Kelas';
    } else if (session.role === 'ADMIN') {
      studentClass = 'Tim Administrator';
    }

    const newPost = await (prisma as any).bkWorkPost.create({
      data: {
        userId: session.id,
        studentId: session.studentId || null,
        studentName: session.name,
        studentClass,
        userRole: session.role,
        avatarUrl,
        imageUrl,
        caption: caption.trim(),
        category,
        status: 'published',
        likesCount: 0,
        commentsCount: 0,
        reportsCount: 0
      }
    });

    // Activity Log
    try {
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          userRole: session.role,
          action: 'CREATE_KARYA_BK',
          module: 'Karya BK Siswa',
          details: `Membuat postingan Karya BK kategori "${category}": "${caption.slice(0, 50)}..."`
        }
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Karyamu berhasil dibagikan! 🎉',
      post: newPost
    });
  } catch (error: any) {
    console.error('Error creating BK karya post:', error);
    return NextResponse.json({ error: 'Gagal memposting Karya BK: ' + error.message }, { status: 500 });
  }
}
