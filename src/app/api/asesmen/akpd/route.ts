import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const AKPD_ITEMS = [
  // 1. BIDANG PRIBADI (10 Butir)
  { id: 'P01', category: 'Pribadi', text: 'Saya merasa sulit mengendalikan emosi atau rasa marah ketika tersinggung oleh orang lain.' },
  { id: 'P02', category: 'Pribadi', text: 'Saya sering merasa kurang percaya diri, cemas, atau malu saat diminta tampil di depan umum.' },
  { id: 'P03', category: 'Pribadi', text: 'Saya merasa belum bisa menerima keadaan fisik atau penampilan diri saya apa adanya.' },
  { id: 'P04', category: 'Pribadi', text: 'Saya merasa kesulitan menjalankan ibadah secara teratur dan konsisten setiap hari.' },
  { id: 'P05', category: 'Pribadi', text: 'Saya sering merasa stres, tertekan, atau overthinking terhadap masa depan saya.' },
  { id: 'P06', category: 'Pribadi', text: 'Saya bingung bagaimana cara mengenali potensi, kelebihan, dan kelemahan dalam diri saya.' },
  { id: 'P07', category: 'Pribadi', text: 'Saya kesulitan mengelola uang saku dan belum terbiasa hidup hemat atau menabung.' },
  { id: 'P08', category: 'Pribadi', text: 'Saya merasa mudah putus asa atau menyerah ketika menghadapi kegagalan.' },
  { id: 'P09', category: 'Pribadi', text: 'Saya bingung menghadapi perubahan fisik dan psikologis pada masa pubertas.' },
  { id: 'P10', category: 'Pribadi', text: 'Saya sering merasa kesepian atau merasa tidak ada orang yang memahami perasaan saya.' },

  // 2. BIDANG SOSIAL (10 Butir)
  { id: 'S01', category: 'Sosial', text: 'Saya merasa canggung, kaku, atau sulit bergaul dan mencari teman baru di lingkungan sekolah.' },
  { id: 'S02', category: 'Sosial', text: 'Saya pernah mengalami ejekan, hinaan, dikucilkan, atau intimidasi (bullying) dari teman.' },
  { id: 'S03', category: 'Sosial', text: 'Saya merasa sulit menolak ajakan teman sebaya meskipun saya tahu hal itu melanggar aturan.' },
  { id: 'S04', category: 'Sosial', text: 'Saya sering berselisih paham atau bertengkar dengan teman dekat dan bingung cara menyelesaikannya.' },
  { id: 'S05', category: 'Sosial', text: 'Saya merasa kurang nyaman atau memiliki masalah komunikasi dengan orang tua / keluarga di rumah.' },
  { id: 'S06', category: 'Sosial', text: 'Saya kesulitan menyampaikan pendapat atau bersikap asertif kepada orang lain.' },
  { id: 'S07', category: 'Sosial', text: 'Saya merasa sering menjadi sasaran gosip atau komentar negatif di media sosial.' },
  { id: 'S08', category: 'Sosial', text: 'Saya merasa sulit bekerja sama secara efektif dalam kerja kelompok.' },
  { id: 'S09', category: 'Sosial', text: 'Saya ingin belajar cara etika bergaul dan sopan santun dengan guru dan orang yang lebih tua.' },
  { id: 'S10', category: 'Sosial', text: 'Saya merasa mudah terpengaruh oleh tren pergaulan negatif di lingkungan sekitar.' },

  // 3. BIDANG BELAJAR (10 Butir)
  { id: 'B01', category: 'Belajar', text: 'Saya sering menunda-nunda mengerjakan tugas sekolah (prokrastinasi) hingga mendekati batas waktu.' },
  { id: 'B02', category: 'Belajar', text: 'Saya kesulitan membagi waktu antara belajar, membantu orang tua, dan bermain game / gadget.' },
  { id: 'B03', category: 'Belajar', text: 'Saya merasa cepat bosan, mengantuk, atau sulit berkonsentrasi saat guru menjelaskan pelajaran.' },
  { id: 'B04', category: 'Belajar', text: 'Saya belum mengetahui gaya belajar yang paling efektif dan tepat untuk diri saya.' },
  { id: 'B05', category: 'Belajar', text: 'Saya merasa cemas dan panik berlebihan ketika akan menghadapi ujian atau ulangan harian.' },
  { id: 'B06', category: 'Belajar', text: 'Saya merasa kesulitan memahami mata pelajaran tertentu (seperti Matematika / IPA / Bahasa).' },
  { id: 'B07', category: 'Belajar', text: 'Saya tidak memiliki tempat atau suasana belajar yang tenang dan nyaman di rumah.' },
  { id: 'B08', category: 'Belajar', text: 'Saya merasa motivasi dan semangat belajar saya menurun drastis belakangan ini.' },
  { id: 'B09', category: 'Belajar', text: 'Saya merasa malu atau takut untuk bertanya kepada guru saat belum memahami materi pelajaran.' },
  { id: 'B10', category: 'Belajar', text: 'Saya kesulitan mengingat atau menghafal materi pelajaran dalam jangka waktu lama.' },

  // 4. BIDANG KARIER (10 Butir)
  { id: 'K01', category: 'Karier', text: 'Saya belum memiliki gambaran yang jelas mengenai cita-cita atau profesi masa depan saya.' },
  { id: 'K02', category: 'Karier', text: 'Saya bingung memilih antara melanjutkan ke SMA, SMK, atau MA setelah lulus dari SMP.' },
  { id: 'K03', category: 'Karier', text: 'Saya belum mengetahui bakat dan minat khusus yang saya miliki untuk dikembangkan.' },
  { id: 'K04', category: 'Karier', text: 'Cita-cita yang saya inginkan berbeda dengan harapan atau pilihan orang tua saya.' },
  { id: 'K05', category: 'Karier', text: 'Saya ingin mengetahui informasi tentang berbagai jenis profesi dan peluang kerja modern di masa depan.' },
  { id: 'K06', category: 'Karier', text: 'Saya khawatir biaya pendidikan akan menghalangi saya untuk melanjutkan sekolah yang saya impikan.' },
  { id: 'K07', category: 'Karier', text: 'Saya ingin tahu kelebihan dan kekurangan antara jurusan IPA, IPS, Bahasa, atau Kejuruan SMK.' },
  { id: 'K08', category: 'Karier', text: 'Saya merasa hobi yang saya sukai belum bisa diarahkan menjadi karier di masa depan.' },
  { id: 'K09', category: 'Karier', text: 'Saya ingin belajar cara merencanakan masa depan sejak dini agar tidak salah langkah.' },
  { id: 'K10', category: 'Karier', text: 'Saya merasa belum memiliki keterampilan praktis yang bermanfaat untuk kehidupan mandiri.' }
];

// GET: Ambil daftar butir soal AKPD dan status pengisian siswa
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let existingResult = null;

    if (session.role === 'MURID' && session.studentId) {
      existingResult = await prisma.assessmentResult.findFirst({
        where: {
          studentId: session.studentId,
          assessmentName: { contains: 'AKPD' }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json({
      items: AKPD_ITEMS,
      totalItems: AKPD_ITEMS.length,
      existingResult
    });
  } catch (error: any) {
    console.error('Error fetching AKPD items:', error);
    return NextResponse.json({ error: 'Gagal memuat butir AKPD' }, { status: 500 });
  }
}

// POST: Simpan hasil pengisian AKPD Online siswa
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { selectedItemIds = [], notes } = body;

    let targetStudentId = session.studentId;
    if (!targetStudentId) {
      // Cari student berdasarkan nipNis atau username
      const student = await prisma.student.findFirst({
        where: {
          OR: [{ nis: session.username }, { nisn: session.username }]
        }
      });
      if (student) {
        targetStudentId = student.id;
      } else {
        return NextResponse.json({ error: 'Data peserta didik tidak ditemukan' }, { status: 404 });
      }
    }

    const studentRecord = await prisma.student.findUnique({
      where: { id: targetStudentId },
      include: { currentClass: true }
    });

    if (!studentRecord) {
      return NextResponse.json({ error: 'Profil siswa tidak valid' }, { status: 404 });
    }

    // Hitung distribusi kebutuhan per 4 bidang
    const selectedItems = AKPD_ITEMS.filter(item => selectedItemIds.includes(item.id));
    const countPribadi = selectedItems.filter(i => i.category === 'Pribadi').length;
    const countSosial = selectedItems.filter(i => i.category === 'Sosial').length;
    const countBelajar = selectedItems.filter(i => i.category === 'Belajar').length;
    const countKarier = selectedItems.filter(i => i.category === 'Karier').length;

    const totalSelected = selectedItems.length;
    const percentPribadi = Math.round((countPribadi / 10) * 100);
    const percentSosial = Math.round((countSosial / 10) * 100);
    const percentBelajar = Math.round((countBelajar / 10) * 100);
    const percentKarier = Math.round((countKarier / 10) * 100);

    // Tentukan kategori dominan
    const scores = [
      { name: 'Belajar', val: countBelajar, pct: percentBelajar },
      { name: 'Pribadi', val: countPribadi, pct: percentPribadi },
      { name: 'Sosial', val: countSosial, pct: percentSosial },
      { name: 'Karier', val: countKarier, pct: percentKarier }
    ].sort((a, b) => b.val - a.val);

    const dominantField = scores[0];
    const categoryStatus = totalSelected >= 15 ? 'Kebutuhan Tinggi' : totalSelected >= 7 ? 'Kebutuhan Sedang' : 'Kebutuhan Rendah (Stabil)';

    const interpretation = `Hasil AKPD menunjukkan peserta didik memiliki ${totalSelected} butir kebutuhan prioritas (Tingkat: ${categoryStatus}). Kebutuhan tertinggi berada pada Bidang ${dominantField.name} (${dominantField.pct}%). Rincian distribusi 4 Bidang Layanan: Belajar (${percentBelajar}%), Pribadi (${percentPribadi}%), Sosial (${percentSosial}%), dan Karier (${percentKarier}%).`;

    const attentionAreasList = selectedItems.map((it, idx) => `${idx + 1}. [${it.category}] ${it.text}`).join('\n');

    let recommendations = '';
    if (dominantField.name === 'Belajar') {
      recommendations = 'Diberikan layanan Bimbingan Klasikal mengenai Manajemen Waktu & Strategi Gaya Belajar Efektif, serta konseling individual bagi siswa yang mengalami kesulitan konsentrasi atau prokrastinasi.';
    } else if (dominantField.name === 'Pribadi') {
      recommendations = 'Diberikan layanan Bimbingan Kelompok tentang Regulasi Emosi, Meningkatkan Kepercayaan Diri, dan Pembinaan Karakter Positif.';
    } else if (dominantField.name === 'Sosial') {
      recommendations = 'Diberikan bimbingan klasikal mengenai Etika Pertemanan Sehat, Keterampilan Komunikasi Asertif, dan Sosialisasi Pencegahan Perundungan (Anti-Bullying).';
    } else {
      recommendations = 'Diberikan layanan Bimbingan Karier mengenai Eksplorasi Cita-cita dan Pengenalan Peminatan Sekolah Lanjutan (SMA vs SMK).';
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Simpan ke AssessmentResult
    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        studentId: targetStudentId,
        assessmentName: 'AKPD (Angket Kebutuhan Peserta Didik)',
        date: todayStr,
        academicYear: '2025/2026',
        score: totalSelected,
        category: `${categoryStatus} (Dominan: ${dominantField.name})`,
        interpretation,
        attentionAreas: attentionAreasList,
        recommendations,
        bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.'
      }
    });

    // Buat notifikasi untuk Guru BK
    await prisma.notification.create({
      data: {
        userId: targetStudentId,
        title: 'Asesmen AKPD Selesai Diisi',
        message: `${studentRecord.name} (Kelas ${studentRecord.currentClass?.name}) telah menyelesaikan AKPD Online dengan ${totalSelected} butir kebutuhan (Dominan: ${dominantField.name}).`,
        type: 'ASSESSMENT',
        link: `/siswa/${targetStudentId}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Asesmen AKPD berhasil disimpan!',
      result: assessmentResult,
      summary: {
        totalSelected,
        pribadi: { count: countPribadi, percent: percentPribadi },
        sosial: { count: countSosial, percent: percentSosial },
        belajar: { count: countBelajar, percent: percentBelajar },
        karier: { count: countKarier, percent: percentKarier },
        dominantField: dominantField.name,
        categoryStatus
      }
    });
  } catch (error: any) {
    console.error('Error submitting AKPD:', error);
    return NextResponse.json({ error: 'Gagal menyimpan jawaban AKPD: ' + error.message }, { status: 500 });
  }
}
