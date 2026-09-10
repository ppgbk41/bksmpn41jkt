// Core Instrument & Data Definitions for Asesmen BK SMP 41 JKT

export interface AssessmentItem {
  id: string;
  category: string; // e.g. Pribadi, Sosial, Belajar, Karier, R, I, A, S, E, C, etc.
  text: string;
  severity?: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
}

// 1. AKPD ITEMS (40 Items)
export const DEFAULT_AKPD_ITEMS: AssessmentItem[] = [
  // Pribadi
  { id: 'P01', category: 'Pribadi', text: 'Saya merasa sulit mengendalikan emosi atau rasa marah ketika tersinggung oleh orang lain.', severity: 'ATTENTION' },
  { id: 'P02', category: 'Pribadi', text: 'Saya sering merasa kurang percaya diri, cemas, atau malu saat diminta tampil di depan umum.', severity: 'NORMAL' },
  { id: 'P03', category: 'Pribadi', text: 'Saya merasa belum bisa menerima keadaan fisik atau penampilan diri saya apa adanya.', severity: 'NORMAL' },
  { id: 'P04', category: 'Pribadi', text: 'Saya merasa kesulitan menjalankan ibadah secara teratur dan konsisten setiap hari.', severity: 'NORMAL' },
  { id: 'P05', category: 'Pribadi', text: 'Saya sering merasa stres, tertekan, overthinking, atau merasa tidak memiliki harapan akan masa depan.', severity: 'CRITICAL' },
  { id: 'P06', category: 'Pribadi', text: 'Saya bingung bagaimana cara mengenali potensi, kelebihan, dan kelemahan dalam diri saya.', severity: 'NORMAL' },
  { id: 'P07', category: 'Pribadi', text: 'Saya kesulitan mengelola uang saku dan belum terbiasa hidup hemat atau menabung.', severity: 'NORMAL' },
  { id: 'P08', category: 'Pribadi', text: 'Saya merasa mudah putus asa, menyakiti diri sendiri, atau menyerah saat menghadapi masalah berat.', severity: 'CRITICAL' },
  { id: 'P09', category: 'Pribadi', text: 'Saya bingung menghadapi perubahan fisik dan psikologis pada masa pubertas.', severity: 'NORMAL' },
  { id: 'P10', category: 'Pribadi', text: 'Saya sering merasa kesepian, terisolasi, atau merasa tidak ada orang yang peduli pada saya.', severity: 'ATTENTION' },

  // Sosial
  { id: 'S01', category: 'Sosial', text: 'Saya merasa canggung, kaku, atau sulit bergaul dan mencari teman baru di lingkungan sekolah.', severity: 'NORMAL' },
  { id: 'S02', category: 'Sosial', text: 'Saya sedang mengalami ejekan, hinaan, pemerasan, atau pengucilan (bullying) dari teman.', severity: 'CRITICAL' },
  { id: 'S03', category: 'Sosial', text: 'Saya merasa sulit menolak ajakan teman sebaya meskipun tahu hal tersebut merugikan atau melanggar aturan.', severity: 'ATTENTION' },
  { id: 'S04', category: 'Sosial', text: 'Saya sering berselisih paham atau bertengkar dengan teman dan bingung cara menyelesaikannya.', severity: 'NORMAL' },
  { id: 'S05', category: 'Sosial', text: 'Saya mengalami masalah pertengkaran/kekerasan komunikasi di rumah dengan orang tua atau keluarga.', severity: 'CRITICAL' },
  { id: 'S06', category: 'Sosial', text: 'Saya kesulitan menyampaikan pendapat secara jujur dan bersikap asertif kepada orang lain.', severity: 'NORMAL' },
  { id: 'S07', category: 'Sosial', text: 'Saya merasa sering menjadi sasaran gosip atau perundungan siber (cyberbullying) di media sosial.', severity: 'ATTENTION' },
  { id: 'S08', category: 'Sosial', text: 'Saya merasa sulit bekerja sama secara efektif dalam kegiatan kelompok.', severity: 'NORMAL' },
  { id: 'S09', category: 'Sosial', text: 'Saya ingin belajar etika bergaul dan sopan santun yang baik dengan guru dan sesama teman.', severity: 'NORMAL' },
  { id: 'S10', category: 'Sosial', text: 'Saya merasa mudah terpengaruh oleh kebiasaan buruk teman sekelompok.', severity: 'ATTENTION' },

  // Belajar
  { id: 'B01', category: 'Belajar', text: 'Saya sering menunda-nunda mengerjakan tugas sekolah (prokrastinasi) hingga mendekati tenggat waktu.', severity: 'NORMAL' },
  { id: 'B02', category: 'Belajar', text: 'Saya kecanduan bermain game / kecanduan HP hingga mengganggu waktu tidur dan belajar.', severity: 'ATTENTION' },
  { id: 'B03', category: 'Belajar', text: 'Saya merasa cepat bosan, mengantuk, atau sulit berkonsentrasi saat guru menjelaskan di kelas.', severity: 'NORMAL' },
  { id: 'B04', category: 'Belajar', text: 'Saya belum mengetahui strategi dan gaya belajar yang paling cocok untuk diri saya.', severity: 'NORMAL' },
  { id: 'B05', category: 'Belajar', text: 'Saya merasa panik berlebihan, cemas, atau mual tiap kali akan menghadapi ujian/ulangan.', severity: 'ATTENTION' },
  { id: 'B06', category: 'Belajar', text: 'Saya merasa sangat kesulitan memahami mata pelajaran tertentu (seperti Matematika / IPA / Bahasa Inggris).', severity: 'NORMAL' },
  { id: 'B07', category: 'Belajar', text: 'Saya tidak memiliki suasana atau fasilitas belajar yang mendukung di rumah.', severity: 'NORMAL' },
  { id: 'B08', category: 'Belajar', text: 'Saya sering membolos atau enggan masuk sekolah karena malas atau merasa tidak mampu.', severity: 'CRITICAL' },
  { id: 'B09', category: 'Belajar', text: 'Saya merasa takut atau malu bertanya kepada guru ketika belum memahami materi.', severity: 'NORMAL' },
  { id: 'B10', category: 'Belajar', text: 'Saya kesulitan mengingat atau mengulang kembali materi pelajaran yang telah dipelajari.', severity: 'NORMAL' },

  // Karier
  { id: 'K01', category: 'Karier', text: 'Saya belum memiliki gambaran cita-cita atau pilihan karier masa depan.', severity: 'NORMAL' },
  { id: 'K02', category: 'Karier', text: 'Saya bingung menentukan pilihan sekolah lanjutan (SMA / SMK / MA) setelah lulus SMP.', severity: 'NORMAL' },
  { id: 'K03', category: 'Karier', text: 'Saya belum memahami bakat khusus atau keahlian utama yang ada dalam diri saya.', severity: 'NORMAL' },
  { id: 'K04', category: 'Karier', text: 'Cita-cita dan minat saya bertentangan dengan keinginan atau harapan orang tua.', severity: 'ATTENTION' },
  { id: 'K05', category: 'Karier', text: 'Saya membutuhkan informasi mendalam mengenai profil berbagai jenis pekerjaan modern.', severity: 'NORMAL' },
  { id: 'K06', category: 'Karier', text: 'Saya khawatir kendala ekonomi/biaya akan menghalangi saya melanjutkan pendidikan ke jenjang lanjutan.', severity: 'ATTENTION' },
  { id: 'K07', category: 'Karier', text: 'Saya bingung memilih jurusan peminatan (seperti IPA, IPS, Bahasa, atau Kejuruan spesifik).', severity: 'NORMAL' },
  { id: 'K08', category: 'Karier', text: 'Saya merasa hobi dan kegemaran saya belum dapat disalurkan menjadi potensi karier.', severity: 'NORMAL' },
  { id: 'K09', category: 'Karier', text: 'Saya ingin mempelajari cara membuat perencanaan karir yang realistis sejak SMP.', severity: 'NORMAL' },
  { id: 'K10', category: 'Karier', text: 'Saya merasa belum memiliki keterampilan mandiri yang siap digunakan di dunia luar.', severity: 'NORMAL' }
];

// 2. RIASEC ITEMS (30 Items - 5 per Holland Dimension)
export const DEFAULT_RIASEC_ITEMS = [
  // Realistic (R)
  { id: 'R01', category: 'Realistic', text: 'Saya suka memperbaiki barang elektronik, sepeda, atau alat mekanik yang rusak.' },
  { id: 'R02', category: 'Realistic', text: 'Saya lebih menyukai kegiatan praktek fisik atau olahraga di luar ruangan daripada berdiam di kelas.' },
  { id: 'R03', category: 'Realistic', text: 'Saya tertarik menggunakan peralatan pertukangan, teknik, atau mesin digital.' },
  { id: 'R04', category: 'Realistic', text: 'Saya suka merawat tanaman, hewan, atau kegiatan yang berhubungan dengan alam terbuka.' },
  { id: 'R05', category: 'Realistic', text: 'Saya lebih suka bekerja membuat produk nyata dengan tangan sendiri.' },

  // Investigative (I)
  { id: 'I01', category: 'Investigative', text: 'Saya senang memecahkan teka-teki logika, soal Matematika, atau teka-teki sains.' },
  { id: 'I02', category: 'Investigative', text: 'Saya suka melakukan eksperimen ilmiah dan mencari tahu alasan logis di balik suatu kejadian.' },
  { id: 'I03', category: 'Investigative', text: 'Saya gemar membaca buku pengetahuan, ensiklopedia, atau artikel sains populer.' },
  { id: 'I04', category: 'Investigative', text: 'Saya senang menganalisis data, grafik, atau sebab-akibat suatu fenomena.' },
  { id: 'I05', category: 'Investigative', text: 'Saya menyukai tantangan berpikir kritis saat menghadapi masalah yang rumit.' },

  // Artistic (A)
  { id: 'A01', category: 'Artistic', text: 'Saya gemar menggambar, melukis, mendesain grafis, atau mengedit foto/video.' },
  { id: 'A02', category: 'Artistic', text: 'Saya suka menulis puisi, cerita fiksi, drama, atau konten kreatif lainnya.' },
  { id: 'A03', category: 'Artistic', text: 'Saya menikmati musik, memainkan alat musik, menyanyi, atau menari.' },
  { id: 'A04', category: 'Artistic', text: 'Saya lebih suka cara kerja yang bebas, ekspresif, dan fleksibel tanpa aturan kaku.' },
  { id: 'A05', category: 'Artistic', text: 'Saya tertarik dengan dunia seni visual, estetika busana, dekorasi, atau arsitektur.' },

  // Social (S)
  { id: 'S01', category: 'Social', text: 'Saya senang mendengarkan dan membantu teman yang sedang memiliki masalah emosional.' },
  { id: 'S02', category: 'Social', text: 'Saya tertarik dengan kegiatan relawan sosial, kepramukaan, atau aksi kemanusiaan.' },
  { id: 'S03', category: 'Social', text: 'Saya merasa bahagia saat dapat mengajari teman pelajaran yang belum mereka pahami.' },
  { id: 'S04', category: 'Social', text: 'Saya mudah bersosialisasi dan memikirkan perasaan orang di sekitar saya.' },
  { id: 'S05', category: 'Social', text: 'Saya ingin bekerja di bidang yang langsung melayani dan menyejahterakan masyarakat.' },

  // Enterprising (E)
  { id: 'E01', category: 'Enterprising', text: 'Saya berani memimpin kelompok atau menjadi ketua organisasi/kegiatan sekolah.' },
  { id: 'E02', category: 'Enterprising', text: 'Saya menyukai kegiatan berjualan, berbisnis, atau menawarkan barang/jasa.' },
  { id: 'E03', category: 'Enterprising', text: 'Saya percaya diri dalam meyakinkan orang lain untuk mengikuti ide atau pendapat saya.' },
  { id: 'E04', category: 'Enterprising', text: 'Saya menyukai tantangan mengambil risiko dan mencari keuntungan atau kesuksesan.' },
  { id: 'E05', category: 'Enterprising', text: 'Saya senang membuat strategi atau rencana kerja untuk mencapai target bersama.' },

  // Conventional (C)
  { id: 'C01', category: 'Conventional', text: 'Saya suka merapikan arsip, menyusun dokumen, atau mencatat jadwal secara rapi.' },
  { id: 'C02', category: 'Conventional', text: 'Saya sangat memperhatikan kerapihan, ketelitian, dan detail dalam mengerjakan tugas.' },
  { id: 'C03', category: 'Conventional', text: 'Saya merasa nyaman mengikuti aturan resmi, panduan, dan instruksi yang jelas.' },
  { id: 'C04', category: 'Conventional', text: 'Saya senang mencatat keuangaan, menghitung pembukuan saku, atau mengelola data angka.' },
  { id: 'C05', category: 'Conventional', text: 'Saya lebih menyukai rutinitas yang terstruktur dan teratur daripada perubahan mendadak.' }
];

// 3. GAYA BELAJAR ITEMS (15 Items)
export const DEFAULT_GAYA_BELAJAR_ITEMS = [
  // Visual
  { id: 'V01', category: 'Visual', text: 'Saya lebih mudah mengingat pelajaran jika melihat gambar, grafik, diagram, atau video pembelajaran.' },
  { id: 'V02', category: 'Visual', text: 'Saya suka menandai catatan dengan pensil warna, stabilo, atau membuat mind mapping yang estetik.' },
  { id: 'V03', category: 'Visual', text: 'Saya mudah terdistraksi jika ruangan belajar berantakan atau tidak rapi.' },
  { id: 'V04', category: 'Visual', text: 'Saat menghafal, saya biasanya membayangkan letak tulisan di buku atau catatannya.' },
  { id: 'V05', category: 'Visual', text: 'Saya lebih cepat paham instruksi tertulis daripada instruksi lisannya guru.' },

  // Auditori
  { id: 'A01', category: 'Auditori', text: 'Saya lebih cepat paham materi saat mendengarkan penjelasan langsung dari guru atau podcast.' },
  { id: 'A02', category: 'Auditori', text: 'Saya lebih menyukai belajar sambil mendengarkan musik atau membaca materi dengan suara nyaring.' },
  { id: 'A03', category: 'Auditori', text: 'Saya mudah terdistraksi oleh suara bising atau kegaduhan di sekitar saya.' },
  { id: 'A04', category: 'Auditori', text: 'Saya senang berdiskusi, berdebat, atau menceritakan kembali materi pelajaran kepada teman.' },
  { id: 'A05', category: 'Auditori', text: 'Saat mengingat sesuatu, saya membayangkan ucapan atau kata-kata yang diucapkan orang.' },

  // Kinestetik
  { id: 'K01', category: 'Kinestetik', text: 'Saya sulit duduk diam dalam waktu lama di kelas dan merasa butuh menggerakkan tubuh.' },
  { id: 'K02', category: 'Kinestetik', text: 'Saya lebih mudah paham jika belajar langsung dengan memegang, mencoba, atau mempraktikkannya.' },
  { id: 'K03', category: 'Kinestetik', text: 'Saya sering menggerak-gerakkan kaki, mengetuk pulpen, atau berjalan-jalan saat sedang berpikir.' },
  { id: 'K04', category: 'Kinestetik', text: 'Saya menyukai kelas praktikum laboratorium, olahraga, kerajinan tangan, atau drama.' },
  { id: 'K05', category: 'Kinestetik', text: 'Saat berbicara atau menjelaskan, saya banyak menggunakan gestur dan gerakan tangan.' }
];

// 4. MINAT BAKAT ITEMS (16 Items)
export const DEFAULT_MINAT_BAKAT_ITEMS = [
  { id: 'MB01', category: 'Linguistik (Bahasa)', text: 'Saya mahir menyampaikan pendapat, bercerita, menulis makalah, atau mengarang tulisan secara jelas.' },
  { id: 'MB02', category: 'Linguistik (Bahasa)', text: 'Saya mudah menghafal kata-kata baru dan menyukai pelajaran Bahasa Indonesia / Bahasa Asing.' },
  { id: 'MB03', category: 'Logis-Matematika', text: 'Saya cepat memahami rumus angka, perhitungan keuangan, teka-teki pola, dan analisis kuantitatif.' },
  { id: 'MB04', category: 'Logis-Matematika', text: 'Saya menyukai metode berpikir terstruktur, logika penalaran, dan pemecahan masalah ilmiah.' },
  { id: 'MB05', category: 'Visual-Spasial', text: 'Saya memiliki imajinasi spasial yang baik, mudah membaca peta, denah, menggambar, atau mendesain.' },
  { id: 'MB06', category: 'Visual-Spasial', text: 'Saya tertarik dengan warna, komposisi foto, arsitektur, dan karya seni bergambar.' },
  { id: 'MB07', category: 'Kinestetik-Tubuh', text: 'Saya mahir dalam olahraga, menari, peragaan fisik, atau kerajinan tangan presisi tinggi.' },
  { id: 'MB08', category: 'Kinestetik-Tubuh', text: 'Saya belajar lebih baik ketika terlibat langsung dalam gerakan fisik dan latihan praktik langsung.' },
  { id: 'MB09', category: 'Musikal', text: 'Saya peka terhadap irama musik, dapat membedakan nada suara, menyanyi, atau bermain instrumen.' },
  { id: 'MB10', category: 'Musikal', text: 'Saya mudah mengingat melodi lagu dan sering bersenandung saat sedang beraktivitas.' },
  { id: 'MB11', category: 'Interpersonal (Sosial)', text: 'Saya peka terhadap emosi orang lain, mudah memimpin pertemanan, dan dapat menjadi mediator konflik.' },
  { id: 'MB12', category: 'Interpersonal (Sosial)', text: 'Saya senang bekerja sama dalam tim dan menikmati pergaulan sosial yang luas.' },
  { id: 'MB13', category: 'Intrapersonal (Diri)', text: 'Saya memahami kelebihan & kelemahan diri sendiri, mandiri, dan memiliki motivasi internal tinggi.' },
  { id: 'MB14', category: 'Intrapersonal (Diri)', text: 'Saya gemar merenung, menulis jurnal refleksi pribadi, dan menyusun target hidup secara mandiri.' },
  { id: 'MB15', category: 'Naturalis (Alam)', text: 'Saya mencintai lingkungan alam, tertarik pada flora/fauna, isu lingkungan hidup, atau sains geografi.' },
  { id: 'MB16', category: 'Naturalis (Alam)', text: 'Saya menyukai kegiatan di alam terbuka seperti menjelajah, berkemah, atau merawat tanaman.' }
];

// Helper: Calculate Holland Code (top 3 highest dimensions)
export function getHollandCode(scores: { R: number; I: number; A: number; S: number; E: number; C: number }): { code: string; dominant: string } {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const code = sorted.slice(0, 3).map(([key]) => key).join('');
  
  const mapDesc: Record<string, string> = {
    R: 'Realistic (Praktis & Fisik)',
    I: 'Investigative (Analitis & Sains)',
    A: 'Artistic (Kreatif & Ekspresif)',
    S: 'Social (Penolong & Sosialis)',
    E: 'Enterprising (Pemimpin & Bisnis)',
    C: 'Conventional (Terstruktur & Rapi)'
  };
  
  const dominant = mapDesc[sorted[0][0]] || sorted[0][0];
  return { code, dominant };
}

// Helper: Evaluate Alert Severity for AKPD / Assessment Submissions
export function evaluateAssessmentAlert(
  studentName: string,
  className: string,
  selectedItems: AssessmentItem[],
  customSeverityMap: Record<string, string> = {}
): { hasAlert: boolean; severity: 'high' | 'medium' | 'monitoring'; title: string; description: string } {
  let criticalCount = 0;
  let attentionCount = 0;
  const criticalItemNames: string[] = [];
  const attentionItemNames: string[] = [];

  for (const item of selectedItems) {
    const sev = customSeverityMap[item.id] || item.severity || 'NORMAL';
    if (sev === 'CRITICAL') {
      criticalCount++;
      criticalItemNames.push(`[${item.category}] ${item.text}`);
    } else if (sev === 'ATTENTION') {
      attentionCount++;
      attentionItemNames.push(`[${item.category}] ${item.text}`);
    }
  }

  if (criticalCount > 0) {
    return {
      hasAlert: true,
      severity: 'high',
      title: `Memerlukan perhatian Guru BK (${criticalCount} Butir Kritis)`,
      description: `${studentName} (Kelas ${className}) memilih butir indikator berisiko tinggi:\n- ` + criticalItemNames.slice(0, 3).join('\n- ')
    };
  }

  if (attentionCount >= 3 || selectedItems.length >= 15) {
    return {
      hasAlert: true,
      severity: 'medium',
      title: `Memerlukan peninjauan Guru BK (${attentionCount} Butir Perhatian)`,
      description: `${studentName} (Kelas ${className}) menunjukkan akumulasi kebutuhan tinggi (${selectedItems.length} total butir terpilih, ${attentionCount} bidang perhatian).`
    };
  }

  if (selectedItems.length >= 8) {
    return {
      hasAlert: true,
      severity: 'monitoring',
      title: `Memerlukan peninjauan Guru BK (Pemantauan Berkala)`,
      description: `${studentName} (Kelas ${className}) memilih ${selectedItems.length} butir angket kebutuhan.`
    };
  }

  return {
    hasAlert: false,
    severity: 'monitoring',
    title: '',
    description: ''
  };
}

// Helper: Sosiometri Matrix & Network Engine
export interface SociometricAnalysis {
  matrix: Record<string, Record<string, number>>; // fromStudentId -> toStudentId -> count
  choiceCounts: Record<string, number>; // studentId -> received count
  mutualPairs: Array<{ student1: string; student2: string; student1Name: string; student2Name: string }>;
  starStudents: string[]; // High choices (e.g. >= 4)
  isolatedStudents: string[]; // Low choices (e.g. <= 1 or 0)
}

export function calculateSociometry(
  choices: Array<{ fromStudentId: string; toStudentId: string; choiceOrder: number }>,
  classStudents: Array<{ id: string; name: string }>
): SociometricAnalysis {
  const matrix: Record<string, Record<string, number>> = {};
  const choiceCounts: Record<string, number> = {};
  const choicesMap: Record<string, Set<string>> = {};

  // Initialize
  classStudents.forEach(s => {
    choiceCounts[s.id] = 0;
    matrix[s.id] = {};
    choicesMap[s.id] = new Set();
    classStudents.forEach(other => {
      matrix[s.id][other.id] = 0;
    });
  });

  // Populate choices
  choices.forEach(c => {
    if (matrix[c.fromStudentId] && matrix[c.fromStudentId][c.toStudentId] !== undefined) {
      matrix[c.fromStudentId][c.toStudentId] = c.choiceOrder;
      choicesMap[c.fromStudentId].add(c.toStudentId);
      choiceCounts[c.toStudentId] = (choiceCounts[c.toStudentId] || 0) + 1;
    }
  });

  // Mutual relationships
  const mutualPairs: Array<{ student1: string; student2: string; student1Name: string; student2Name: string }> = [];
  const processedPairs = new Set<string>();

  classStudents.forEach(s1 => {
    classStudents.forEach(s2 => {
      if (s1.id !== s2.id) {
        const pairKey = [s1.id, s2.id].sort().join(':');
        if (!processedPairs.has(pairKey)) {
          if (choicesMap[s1.id]?.has(s2.id) && choicesMap[s2.id]?.has(s1.id)) {
            mutualPairs.push({
              student1: s1.id,
              student2: s2.id,
              student1Name: s1.name,
              student2Name: s2.name
            });
            processedPairs.add(pairKey);
          }
        }
      }
    });
  });

  const studentCount = classStudents.length;
  const avg = studentCount > 0 ? Object.values(choiceCounts).reduce((a, b) => a + b, 0) / studentCount : 0;

  const starStudents = classStudents.filter(s => choiceCounts[s.id] >= Math.max(3, Math.ceil(avg * 1.5))).map(s => s.id);
  const isolatedStudents = classStudents.filter(s => choiceCounts[s.id] <= 1).map(s => s.id);

  return {
    matrix,
    choiceCounts,
    mutualPairs,
    starStudents,
    isolatedStudents
  };
}
