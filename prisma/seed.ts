import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BK SMP 41 Jakarta Database...');

  // Password hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const bkPassword = await bcrypt.hash('bk123', 10);
  const waliPassword = await bcrypt.hash('wali123', 10);
  const muridPassword = await bcrypt.hash('murid123', 10);

  // 1. Create Academic Years
  const ay1 = await prisma.academicYear.upsert({
    where: { year: '2024/2025' },
    update: {},
    create: { year: '2024/2025', semester: 'Genap', isCurrent: false }
  });

  const ay2 = await prisma.academicYear.upsert({
    where: { year: '2025/2026' },
    update: {},
    create: { year: '2025/2026', semester: 'Ganjil', isCurrent: true }
  });

  // 2. Create All 21 Classes (7A-7G, 8A-8G, 9A-9G)
  const classLevels = [
    { level: 7, teacherPrefix: 'Wali Kelas 7' },
    { level: 8, teacherPrefix: 'Wali Kelas 8' },
    { level: 9, teacherPrefix: 'Wali Kelas 9' }
  ];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  const classMap: Record<string, any> = {};

  for (const lvl of classLevels) {
    for (const sec of sections) {
      const className = `${lvl.level}${sec}`;
      const teacherName = `${lvl.teacherPrefix}${sec}, S.Pd.`;
      const createdClass = await prisma.class.upsert({
        where: { name: className },
        update: { teacherName },
        create: {
          name: className,
          level: lvl.level,
          section: sec,
          academicYear: '2025/2026',
          teacherName,
          teacherNip: `19800101200501${lvl.level}${sec.charCodeAt(0)}`
        }
      });
      classMap[className] = createdClass;
    }
  }

  // 3. Create Users
  // Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@smp41jkt.sch.id',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'Administrator BK',
      nipNis: '197508121998031001',
      phone: '081234567890',
      mustChangePassword: false
    }
  });

  // Guru BK 1 (Kordinator BK)
  const guruBk1 = await prisma.user.upsert({
    where: { username: 'gurubk' },
    update: {},
    create: {
      username: 'gurubk',
      email: 'siti.aminah@smp41jkt.sch.id',
      passwordHash: bkPassword,
      role: 'GURU_BK',
      name: 'Dra. Hj. Siti Aminah, M.Pd.',
      nipNis: '198504122010011005',
      phone: '081398765432',
      mustChangePassword: false
    }
  });

  // Guru BK 2
  await prisma.user.upsert({
    where: { username: 'bk_ahmad' },
    update: {},
    create: {
      username: 'bk_ahmad',
      email: 'ahmad.bambang@smp41jkt.sch.id',
      passwordHash: bkPassword,
      role: 'GURU_BK',
      name: 'Bambang Ahmad, S.Psi.',
      nipNis: '199002152015031002',
      phone: '081511223344',
      mustChangePassword: false
    }
  });

  // Wali Kelas 7A, 8A, 9A
  await prisma.user.upsert({
    where: { username: 'walikelas7a' },
    update: {},
    create: {
      username: 'walikelas7a',
      email: 'supriadi@smp41jkt.sch.id',
      passwordHash: waliPassword,
      role: 'WALI_KELAS',
      name: 'Drs. Supriadi',
      nipNis: '198203102008011003',
      phone: '081765432109',
      activeClassId: classMap['7A'].id,
      mustChangePassword: false
    }
  });

  await prisma.user.upsert({
    where: { username: 'walikelas8a' },
    update: {},
    create: {
      username: 'walikelas8a',
      email: 'nurlaila@smp41jkt.sch.id',
      passwordHash: waliPassword,
      role: 'WALI_KELAS',
      name: 'Nurlaila, S.Pd.',
      nipNis: '198705202011012004',
      phone: '081876543210',
      activeClassId: classMap['8A'].id,
      mustChangePassword: false
    }
  });

  await prisma.user.upsert({
    where: { username: 'walikelas9a' },
    update: {},
    create: {
      username: 'walikelas9a',
      email: 'eko.prasetyo@smp41jkt.sch.id',
      passwordHash: waliPassword,
      role: 'WALI_KELAS',
      name: 'Eko Prasetyo, M.Pd.',
      nipNis: '198109152006041002',
      phone: '081987654321',
      activeClassId: classMap['9A'].id,
      mustChangePassword: false
    }
  });

  // 4. Create Students (Sample 15+ students across Grade 7, 8, 9)
  const rawStudents = [
    // Kelas 7
    { nis: '24701', nisn: '0081234567', name: 'Ahmad Rizky Pratama', gender: 'L', class: '7A', phone: '085711112222', address: 'Jl. Ragunan No. 12, Pasar Minggu', father: 'Budi Pratama', mother: 'Siti Rahma', job: 'PNS', status: 'Aktif' },
    { nis: '24702', nisn: '0082345678', name: 'Anisa Rahmawati', gender: 'P', class: '7A', phone: '085722223333', address: 'Jl. Kebagusan Raya No. 45', father: 'Hendra Rahmawan', mother: 'Dewi Lestari', job: 'Karyawan Swasta', status: 'Aktif' },
    { nis: '24703', nisn: '0083456789', name: 'Bayu Saputra', gender: 'L', class: '7B', phone: '085733334444', address: 'Jl. Jatipadang Baru No. 88', father: 'Slamet Saputra', mother: 'Rina Maryani', job: 'Wiraswasta', status: 'Aktif' },
    { nis: '24704', nisn: '0084567890', name: 'Citra Kirana', gender: 'P', class: '7C', phone: '085744445555', address: 'Jl. Ampera Raya No. 20', father: 'Iwan Kirana', mother: 'Maya Putri', job: 'TNI/Polri', status: 'Aktif' },
    { nis: '24705', nisn: '0085678901', name: 'Daffa Al-Farizi', gender: 'L', class: '7D', phone: '085755556666', address: 'Jl. Cilandak KKO No. 34', father: 'Fariz Mansyur', mother: 'Nurbaiti', job: 'Dosen', status: 'Aktif' },
    
    // Kelas 8
    { nis: '23801', nisn: '0079876543', name: 'Siti Nurhaliza', gender: 'P', class: '8A', phone: '085811112222', address: 'Jl. Lenteng Agung No. 15', father: 'Rahmat Hidayat', mother: 'Nur Aini', job: 'Wiraswasta', status: 'Aktif' },
    { nis: '23802', nisn: '0078765432', name: 'Fikri Haikal', gender: 'L', class: '8A', phone: '085822223333', address: 'Jl. TB Simatupang No. 99', father: 'Haikal Hassan', mother: 'Kurnia', job: 'Karyawan Swasta', status: 'Aktif' },
    { nis: '23803', nisn: '0077654321', name: 'Gilang Ramadhan', gender: 'L', class: '8B', phone: '085833334444', address: 'Jl. Warung Buncit No. 7', father: 'Ramadhan Syah', mother: 'Susilowati', job: 'PNS', status: 'Aktif' },
    { nis: '23804', nisn: '0076543210', name: 'Hana Pertiwi', gender: 'P', class: '8C', phone: '085844445555', address: 'Jl. Pejaten Barat No. 56', father: 'Bambang Pertiwi', mother: 'Ratna', job: 'Pedagang', status: 'Aktif' },
    { nis: '23805', nisn: '0075432109', name: 'Indra Wijaya', gender: 'L', class: '8E', phone: '085855556666', address: 'Jl. Mampang Prapatan No. 80', father: 'Wijaya Kusuma', mother: 'Sri Rejeki', job: 'BUMN', status: 'Aktif' },

    // Kelas 9
    { nis: '22901', nisn: '0061122334', name: 'Budi Santoso', gender: 'L', class: '9A', phone: '085911112222', address: 'Jl. Poltangan Raya No. 3', father: 'Santoso Utama', mother: 'Hartati', job: 'Buruh', status: 'Aktif' },
    { nis: '22902', nisn: '0062233445', name: 'Jessica Olivia', gender: 'P', class: '9A', phone: '085922223333', address: 'Jl. Tanjung Barat No. 101', father: 'Robert Olivia', mother: 'Linda', job: 'Arsitek', status: 'Aktif' },
    { nis: '22903', nisn: '0063344556', name: 'Kevin Kurniawan', gender: 'L', class: '9B', phone: '085933334444', address: 'Jl. Mangga Besar No. 22', father: 'Kurniawan Agus', mother: 'Yuli', job: 'Wiraswasta', status: 'Aktif' },
    { nis: '22904', nisn: '0064455667', name: 'Larasati Putri', gender: 'P', class: '9C', phone: '085944445555', address: 'Jl. Bangka Raya No. 44', father: 'Putra Suherman', mother: 'Endang', job: 'PNS', status: 'Aktif' },
    { nis: '22905', nisn: '0065566778', name: 'Muhammad Rizky', gender: 'L', class: '9F', phone: '085955556666', address: 'Jl. Srengseng Sawah No. 12', father: 'Rizky Iskandar', mother: 'Halimah', job: 'Wiraswasta', status: 'Aktif' }
  ];

  const studentMap: Record<string, any> = {};

  for (const s of rawStudents) {
    const targetClass = classMap[s.class];
    const createdStudent = await prisma.student.upsert({
      where: { nis: s.nis },
      update: {},
      create: {
        nis: s.nis,
        nisn: s.nisn,
        name: s.name,
        gender: s.gender,
        birthPlace: 'Jakarta',
        birthDate: s.class.startsWith('7') ? '2012-05-14' : s.class.startsWith('8') ? '2011-08-20' : '2010-02-10',
        religion: 'Islam',
        address: s.address,
        phone: s.phone,
        email: `${s.nisn}@murid.smp41jkt.sch.id`,
        fatherName: s.father,
        motherName: s.mother,
        guardianName: s.father,
        parentPhone: s.phone,
        parentJob: s.job,
        status: s.status,
        currentClassId: targetClass.id,
        notes: 'Siswa kooperatif dan aktif di kegiatan ekstrakurikuler.'
      }
    });

    studentMap[s.nisn] = createdStudent;

    // Create User accounts for test students (0081234567, 0079876543, 0061122334)
    if (['0081234567', '0079876543', '0061122334'].includes(s.nisn)) {
      await prisma.user.upsert({
        where: { username: s.nisn },
        update: {},
        create: {
          username: s.nisn,
          email: `${s.nisn}@murid.smp41jkt.sch.id`,
          passwordHash: muridPassword,
          role: 'MURID',
          name: s.name,
          nipNis: s.nisn,
          phone: s.phone,
          studentId: createdStudent.id,
          mustChangePassword: false
        }
      });
    }

    // Create Student Class History
    if (s.class.startsWith('8')) {
      await prisma.studentClassHistory.create({
        data: {
          studentId: createdStudent.id,
          academicYear: '2024/2025',
          className: '7A',
          status: 'Naik Kelas'
        }
      });
    } else if (s.class.startsWith('9')) {
      await prisma.studentClassHistory.createMany({
        data: [
          { studentId: createdStudent.id, academicYear: '2023/2024', className: '7A', status: 'Naik Kelas' },
          { studentId: createdStudent.id, academicYear: '2024/2025', className: '8A', status: 'Naik Kelas' }
        ]
      });
    }
  }

  // 5. Create Assessment Results
  const studentRizky = studentMap['0081234567']; // Ahmad Rizky Pratama (7A)
  const studentSiti = studentMap['0079876543'];  // Siti Nurhaliza (8A)
  const studentBudi = studentMap['0061122334'];  // Budi Santoso (9A)

  if (studentRizky) {
    await prisma.assessmentResult.createMany({
      data: [
        {
          studentId: studentRizky.id,
          assessmentName: 'Angket Kebutuhan Peserta Didik (AKPD)',
          date: '2025-08-01',
          academicYear: '2025/2026',
          score: 82.5,
          category: 'Sedang',
          interpretation: 'Peserta didik memiliki tingkat kebutuhan pengembangan motivasi belajar dan manajemen waktu yang sedang.',
          attentionAreas: 'Bidang Belajar dan Manajemen Waktu Belajar di Rumah.',
          recommendations: 'Konseling individu untuk pengaturan jadwal belajar mandiri.',
          bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.'
        },
        {
          studentId: studentRizky.id,
          assessmentName: 'Asesmen Gaya Belajar',
          date: '2025-08-03',
          academicYear: '2025/2026',
          score: 90.0,
          category: 'Visual & Kinestetik',
          interpretation: 'Sangat menyukai pembelajaran dengan infografis, video demonstrasi, dan alur visual.',
          attentionAreas: 'Kurang maksimal dalam mendengarkan ceramah panjang.',
          recommendations: 'Gunakan catatan berwarna dan pemetaan pikiran (mind mapping).',
          bkTeacherName: 'Bambang Ahmad, S.Psi.'
        }
      ]
    });
  }

  if (studentSiti) {
    await prisma.assessmentResult.create({
      data: {
        studentId: studentSiti.id,
        assessmentName: 'Asesmen Hubungan Sosio-Emosional',
        date: '2025-07-28',
        academicYear: '2025/2026',
        score: 75.0,
        category: 'Perlu Perhatian',
        interpretation: 'Menunjukkan indikasi kecemasan sosial dan penyesuaian diri di kelas baru.',
        attentionAreas: 'Kepercayaan diri saat berbicara di depan kelas.',
        recommendations: 'Latihan asertif dan pendampingan teman sebaya.',
        bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.'
      }
    });
  }

  // 6. Create Counseling Registrations
  if (studentRizky) {
    await prisma.counselingRegistration.create({
      data: {
        registrationNo: 'REG-2025-08-001',
        studentId: studentRizky.id,
        studentName: studentRizky.name,
        className: '7A',
        phone: studentRizky.phone,
        bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.',
        issueCategory: 'Belajar',
        reason: 'Kesulitan konsentrasi belajar saat malam hari',
        description: 'Sering merasa mengantuk dan kesulitan membagi waktu antara bermain game dengan belajar tugas sekolah.',
        urgencyLevel: 'Perlu dibicarakan dalam waktu dekat',
        preferredDate: '2026-08-10',
        preferredTime: '09:00 WIB',
        mode: 'Tatap Muka',
        privacyAgreed: true,
        status: 'Sudah Dijadwalkan'
      }
    });
  }

  if (studentSiti) {
    const regUrgent = await prisma.counselingRegistration.create({
      data: {
        registrationNo: 'REG-2025-08-002',
        studentId: studentSiti.id,
        studentName: studentSiti.name,
        className: '8A',
        phone: studentSiti.phone,
        bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.',
        issueCategory: 'Perundungan',
        reason: 'Mendapat kata-kata tidak menyenangkan dari teman sekelas',
        description: 'Dipermalukan di grup kelas media sosial dan merasa enggan masuk sekolah.',
        urgencyLevel: 'Mendesak dan membutuhkan bantuan segera',
        preferredDate: '2026-08-07',
        preferredTime: '08:00 WIB',
        mode: 'Tatap Muka',
        privacyAgreed: true,
        status: 'Sedang Ditangani'
      }
    });

    // Create Counseling Schedule for Urgent Registration
    await prisma.counselingSchedule.create({
      data: {
        registrationId: regUrgent.id,
        studentId: studentSiti.id,
        studentName: studentSiti.name,
        className: '8A',
        bkTeacherName: 'Dra. Hj. Siti Aminah, M.Pd.',
        date: '2026-08-07',
        timeSlot: '08:00 - 08:45 WIB',
        mode: 'Tatap Muka',
        location: 'Ruang BK Utama',
        status: 'Terjadwal',
        notes: 'Sesi diprioritaskan karena urgensi tinggi perundungan.'
      }
    });
  }

  // 7. Create Counseling Sessions (Confidential)
  if (studentBudi) {
    const session1 = await prisma.counselingSession.create({
      data: {
        sessionNo: 1,
        studentId: studentBudi.id,
        date: '2026-08-04',
        time: '10:00 WIB',
        location: 'Ruang BK 2',
        bkTeacherName: 'Bambang Ahmad, S.Psi.',
        referralSource: 'Wali Kelas',
        issueCategory: 'Kehadiran',
        issueDescription: 'Peserta didik sering terlambat sekolah 3 kali dalam seminggu terakhir.',
        issueIdentification: 'Membantu orang tua berdagang hingga malam hari sehingga tidur larut malam.',
        goals: 'Membuat jadwal rutin harian agar tetap bisa membantu ortu tanpa mengorbankan waktu tidur.',
        techniques: 'Behavioral Contract & Time Management Chart',
        counselingProcess: 'Konseli menyadari pentingnya waktu dan bersedia membatasi jam berdagang maksimal pukul 21:30 WIB.',
        outcome: 'Konseli membuat komitmen tertulis.',
        agreement: 'Tidur maksimal pukul 22:00 WIB dan disetujui oleh orang tua.',
        followUpPlan: 'Pemantauan absensi mingguan oleh Wali Kelas 9A.',
        nextMeetingDate: '2026-08-18',
        status: 'Membutuhkan Tindak Lanjut',
        confidentialityLevel: 'CONFIDENTIAL'
      }
    });

    // Create Follow-Up
    await prisma.counselingFollowUp.create({
      data: {
        sessionId: session1.id,
        studentId: studentBudi.id,
        type: 'Konsultasi Wali Kelas',
        scheduleDate: '2026-08-11',
        involvedParties: 'Wali Kelas 9A (Eko Prasetyo, M.Pd.) & Guru BK',
        monitoringResult: 'Presensi 3 hari pertama menunjukkan ketepatan waktu.',
        conditionChange: 'Peserta didik tampak lebih segar di pagi hari.',
        nextRecommendations: 'Lanjutkan koordinasi dengan wali kelas.',
        status: 'Dalam Proses'
      }
    });
  }

  // 8. Create Teacher Referrals (Rujukan Wali Kelas)
  if (studentRizky) {
    await prisma.teacherReferral.create({
      data: {
        studentId: studentRizky.id,
        studentName: studentRizky.name,
        className: '7A',
        homeroomTeacherName: 'Drs. Supriadi',
        date: '2026-08-05',
        reason: 'Menyendiri saat jam istirahat dan nilai matematika menurun.',
        observedCondition: 'Terlihat murung dan tidak bergabung dengan teman sekelas.',
        actionsTaken: 'Wali kelas telah menegur ramah dan mengajak bicara singkat.',
        priority: 'Normal',
        notes: 'Mohon dibantu asesmen minat dan pendampingan individu.',
        status: 'Diterima'
      }
    });
  }

  // 9. Notifications
  await prisma.notification.createMany({
    data: [
      {
        targetRole: 'GURU_BK',
        title: 'Pendaftaran Konseling Mendesak!',
        message: 'Peserta didik Siti Nurhaliza (8A) mengajukan konseling kategori Perundungan (Mendesak).',
        type: 'URGENT',
        isRead: false,
        link: '/layanan/konseling'
      },
      {
        targetRole: 'GURU_BK',
        title: 'Rujukan Baru Wali Kelas',
        message: 'Drs. Supriadi (Wali Kelas 7A) merujuk murid Ahmad Rizky Pratama.',
        type: 'REFERRAL',
        isRead: false,
        link: '/layanan/rujukan'
      },
      {
        targetRole: 'MURID',
        userId: studentRizky ? studentRizky.id : undefined,
        title: 'Jadwal Konseling Disetujui',
        message: 'Permohonan konseling Anda telah dijadwalkan pada 10 Agustus 2026 Pukul 09:00 WIB.',
        type: 'SCHEDULE',
        isRead: false,
        link: '/murid/portal'
      }
    ]
  });

  // 10. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: guruBk1.id,
        userName: guruBk1.name,
        userRole: 'GURU_BK',
        action: 'CREATE_COUNSELING_SCHEDULE',
        module: 'Manajemen Konseling',
        details: 'Menyetujui pendaftaran konseling REG-2025-08-002 untuk Siti Nurhaliza (8A)'
      },
      {
        userId: guruBk1.id,
        userName: guruBk1.name,
        userRole: 'GURU_BK',
        action: 'VIEW_CONFIDENTIAL_SESSION',
        module: 'Catatan Konseling',
        details: 'Membuka rekam jejak catatan konseling rahasia Sesi 1 Budi Santoso (9A)'
      }
    ]
  });

  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
