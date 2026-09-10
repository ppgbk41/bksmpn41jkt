// RIASEC Holland Recommendation & Interpretation Engine
// BK SMP Negeri 41 Jakarta

export interface RiasecDimensionDetail {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  name: string;
  titleIndo: string;
  characteristics: string[];
  workStyle: string;
  smaRecommendations: {
    track: string;
    focusSubjects: string[];
    rationale: string;
  };
  smkRecommendations: {
    majors: string[];
    rationale: string;
  };
  universityMajors: {
    category: string;
    majors: string[];
    rationale: string;
  }[];
  careerProspects: {
    title: string;
    industry: string;
    description: string;
  }[];
}

export const RIASEC_KNOWLEDGE_BASE: Record<string, RiasecDimensionDetail> = {
  R: {
    code: 'R',
    name: 'Realistic',
    titleIndo: 'Praktis, Teknis & Fisik',
    characteristics: [
      'Menyukai kerja praktis dengan alat, mesin, atau perangkat fisik',
      'Cenderung berpikir pragmatis, konkrit, dan berfokus pada hasil nyata',
      'Senang beraktivitas outdoor, olahraga, atau menangani produk langsung',
      'Keterampilan mekanis dan kinestetik yang baik'
    ],
    workStyle: 'Lingkungan kerja praktis, berorientasi lapangan, laboratorium teknis, bengkel digital/mekanis, atau alam terbuka.',
    smaRecommendations: {
      track: 'SMA - Jalur MIPA / Matematika & Ilmu Pengetahuan Alam',
      focusSubjects: ['Fisika', 'Matematika Tingkat Lanjut', 'Kimia', 'Informatika'],
      rationale: 'Fokus pada penguasaan sains dasar dan penalaran spasial-fisik sebagai fondasi rekayasa dan teknologi.'
    },
    smkRecommendations: {
      majors: [
        'Teknik Komputer & Jaringan (TKJ)',
        'Rekayasa Perangkat Lunak (RPL)',
        'Teknik Mesin & Otomotif',
        'Teknik Mekatronika & Robotika',
        'Teknik Konstruksi & Properti (Sipil)'
      ],
      rationale: 'Sangat cocok dengan pembelajaran vokasi berbasis praktik tangan langsung dan instalasi perangkat keras/lunak.'
    },
    universityMajors: [
      {
        category: 'Rekayasa & Teknologi',
        majors: ['Teknik Informatika', 'Teknik Mesin', 'Teknik Elektro', 'Teknik Sipil', 'Sistem Komputer'],
        rationale: 'Memaksimalkan minat pemecahan masalah teknis dan perancangan infrastruktur sistem.'
      },
      {
        category: 'Sains Terapan & Penerbangan',
        majors: ['Ilmu Olahraga & Kebugaran', 'Teknik Penerbangan', 'Arsitektur', 'Peternakan & Agroteknologi'],
        rationale: 'Menyalurkan kegemaran beraktivitas fisik dan perawatan produk biologis/fisik.'
      }
    ],
    careerProspects: [
      {
        title: 'Software & Network Engineer',
        industry: 'Teknologi Informasi',
        description: 'Membangun, merawat, dan menguji infrastruktur jaringan komputer serta sistem aplikasi.'
      },
      {
        title: 'Ahli Robotika & Mekatronika',
        industry: 'Manufaktur & Otomasi',
        description: 'Merancang dan mengoperasikan mesin-mesin otomatis dan sistem manufaktur cerdas.'
      },
      {
        title: 'Arsitek & Site Engineer',
        industry: 'Konstruksi & Properti',
        description: 'Mengawasi dan mengarahkan pelaksana teknis pembangunan di lapangan secara presisi.'
      }
    ]
  },
  I: {
    code: 'I',
    name: 'Investigative',
    titleIndo: 'Analitis, Logis & Sains',
    characteristics: [
      'Senang mengamati, mempelajari, menganalisis, dan mengevaluasi data',
      'Memiliki rasa ingin tahu tinggi terhadap fenomena ilmiah dan teka-teki logika',
      'Berpikir kritis, mandiri, teoritis, dan metodis',
      'Menyukai riset mendalam dibandingkan tugas rutin'
    ],
    workStyle: 'Lingkungan riset, laboratorium ilmiah, pusat pengolahan data, akademik, riset teknologi & kesehatan.',
    smaRecommendations: {
      track: 'SMA - Jalur MIPA (Matematika & Sains Murni)',
      focusSubjects: ['Matematika Lanjut', 'Biologi', 'Kimia', 'Fisika'],
      rationale: 'Memberikan dasar kuat dalam metodologi ilmiah, analisa hipotesis, dan pemecahan masalah kuantitatif.'
    },
    smkRecommendations: {
      majors: [
        'Analis Kimia / Kimia Industri',
        'Farmasi Klinis & Komunitas',
        'Teknologi Laboratorium Medik',
        'Rekayasa Perangkat Lunak (Bidang Data Science)'
      ],
      rationale: 'Mengakomodasi minat pengujian sampel, riset formulasi, dan ekstraksi logika pemrograman.'
    },
    universityMajors: [
      {
        category: 'Kesehatan & Kedokteran',
        majors: ['Kedokteran Umum', 'Farmasi', 'Biomedis', 'Kesehatan Masyarakat'],
        rationale: 'Menjawab panggilan jiwa untuk mendiagnosis masalah kesehatan secara komprehensif ilmiah.'
      },
      {
        category: 'Sains Kuantitatif & Data',
        majors: ['Sains Data (Data Science)', 'Statistika', 'Biologi / Bioteknologi', 'Astronomi / Fisika Murni'],
        rationale: 'Fokus pada manipulasi algoritma, penelitian pola data, dan penemuan konsep ilmiah baru.'
      }
    ],
    careerProspects: [
      {
        title: 'Data Scientist & AI Researcher',
        industry: 'Teknologi & Big Data',
        description: 'Menganalisis himpunan data besar untuk menemukan tren, prediksi, dan model kecerdasan buatan.'
      },
      {
        title: 'Dokter / Peneliti Medis',
        industry: 'Kesehatan',
        description: 'Melakukan diagnosis, pengobatan, dan riset pengembangan terapi kesehatan pasien.'
      },
      {
        title: 'Apoteker & Formulator Obat',
        industry: 'Farmasi & Bioteknologi',
        description: 'Mereset dan meracik senyawa obat-obatan aman untuk kebutuhan medis.'
      }
    ]
  },
  A: {
    code: 'A',
    name: 'Artistic',
    titleIndo: 'Kreatif, Ekspresif & Estetis',
    characteristics: [
      'Menyukai kegiatan ekspresi seni, desain visual, musik, tulisan, dan pertunjukan',
      'Imajinatif, inovatif, intuitif, dan tidak menyukai aturan yang terlalu kaku',
      'Sensitif terhadap nilai estetika, keindahan visual, dan komunikasi simbolis',
      'Cenderung Orisinal dan menyukai fleksibilitas karya'
    ],
    workStyle: 'Studio kreatif, agensi periklanan, industri media hiburan, rumah produksi, atau kerja mandiri (freelance).',
    smaRecommendations: {
      track: 'SMA - Jalur Bahasa, Budaya & Seni / Kurikulum Merdeka Terbuka',
      focusSubjects: ['Bahasa & Sastra', 'Seni Budaya & Desain', 'Bahasa Asing', 'Sosiologi Kreatif'],
      rationale: 'Mendorong daya imajinasi visual, wawasan literasi budaya, serta apresiasi estetika tinggi.'
    },
    smkRecommendations: {
      majors: [
        'Desain Komunikasi Visual (DKV)',
        'Animasi & Pengembangan Game',
        'Broadcasting & Perfilman',
        'Tata Busana (Fashion Design)',
        'Seni Rupa & Kriya Kreatif'
      ],
      rationale: 'Melatih secara intensif penguasaan tools software desain modern, menggambar, dan produksi konten visual.'
    },
    universityMajors: [
      {
        category: 'Desain & Media Kreatif',
        majors: ['Desain Komunikasi Visual (DKV)', 'Desain Interior', 'Film & Televisi', 'Desain Produk'],
        rationale: 'Mewadahi bakat visual dalam kemasan profesional bernilai ekonomi dan estetis.'
      },
      {
        category: 'Seni, Musik & Sastra',
        majors: ['Sastra & Bahasa Inggris/Asing', 'Seni Musik', 'Seni Rupa Murni', 'Arsitektur Lansekap'],
        rationale: 'Memperdalam penguasaan narasi cerita, komposisi audio, dan kreasi spasial.'
      }
    ],
    careerProspects: [
      {
        title: 'UI/UX Designer & Graphic Designer',
        industry: 'Teknologi & Produk Digital',
        description: 'Merancang antarmuka aplikasi yang indah, komunikatif, dan nyaman digunakan pengguna.'
      },
      {
        title: 'Animator & Game Concept Artist',
        industry: 'Media & Entertainmen',
        description: 'Menciptakan karakter 2D/3D, aset visual, dan animasi pergerakan game/film.'
      },
      {
        title: 'Creative Content Director & Copywriter',
        industry: 'Pemasaran & Digital Media',
        description: 'Menyusun ide naskah periklanan dan menyutradarai pembuatan kampanye media visual.'
      }
    ]
  },
  S: {
    code: 'S',
    name: 'Social',
    titleIndo: 'Penolong, Empatis & Sosialis',
    characteristics: [
      'Senang membantu, mengajari, menyembuhkan, merawat, dan membimbing orang lain',
      'Memiliki tingkat empati tinggi, komunikatif, bersahabat, dan kooperatif',
      'Peka terhadap kebutuhan emosional dan hubungan antarmanusia di masyarakat',
      'Menyukai pekerjaan berdampak sosial langsung dibandingkan dengan benda matang'
    ],
    workStyle: 'Sekolah/Lembaga Pendidikan, Rumah Sakit, Klinik Psikologi, Lembaga Swadaya Masyarakat (LSM), Pelayanan Publik.',
    smaRecommendations: {
      track: 'SMA - Jalur IPS (Ilmu Pengetahuan Sosial)',
      focusSubjects: ['Sosiologi', 'Geografi', 'Sejarah', 'Psikologi Dasar / Bahasa'],
      rationale: 'Membangun pemahaman struktur masyarakat, dinamika interaksi sosial, dan kepedulian kemanusiaan.'
    },
    smkRecommendations: {
      majors: [
        'Pekerjaan Sosial (Peksos)',
        'Keperawatan & Asisten Keperawatan',
        'Usaha Layanan Wisata & Perhotelan',
        'Pendidikan Anak Usia Dini (PAUD)'
      ],
      rationale: 'Memberikan bekal praktik pelayanan kesehatan dasar, pendampingan sosial, dan hospitality.'
    },
    universityMajors: [
      {
        category: 'Psikologi & Kemanusiaan',
        majors: ['Psikologi', 'Bimbingan dan Konseling (BK)', 'Kesejahteraan Sosial', 'Ilmu Hubungan Internasional'],
        rationale: 'Studi mendalam mengenai perilaku manusia, terapi emosional, dan resolusi konflik sosial.'
      },
      {
        category: 'Pendidikan & Kesehatan',
        majors: ['Pendidikan Guru (PGSD/FKIP)', 'Ilmu Keperawatan', 'Gizi & Kesehatan Masyarakat'],
        rationale: 'Menyiapkan diri menjadi pendidik dan tenaga medis yang mendedikasikan hidup untuk kemajuan masyarakat.'
      }
    ],
    careerProspects: [
      {
        title: 'Psikolog & Konselor Sekolah/Karier',
        industry: 'Kesehatan Mental & Pendidikan',
        description: 'Membantu individu dan peserta didik mengatasi hambatan emosional dan merencanakan masa depan.'
      },
      {
        title: 'Guru / Dosen Pengajar',
        industry: 'Pendidikan',
        description: 'Menyampaikan ilmu pengetahuan dan membimbing karakter generasi muda.'
      },
      {
        title: 'HR People Development Specialist',
        industry: 'Korporat & Industri',
        description: 'Mengelola pelatihan karyawan, hubungan kerja yang harmonis, dan kesejahteraan tim.'
      }
    ]
  },
  E: {
    code: 'E',
    name: 'Enterprising',
    titleIndo: 'Pemimpin, Persuasif & Bisnis',
    characteristics: [
      'Senang memimpin, meyakinkan (persuasi), dan mengarahkan orang lain mencapai target',
      'Berani mengambil risiko bisnis, kompetitif, percaya diri, dan berenergi tinggi',
      'Tertarik pada aktivitas penjualan, wirausaha, negosiasi, dan manajemen organisasi',
      'Fokus pada pengaruh sosial, pencapaian keuangan, dan kepemimpinan'
    ],
    workStyle: 'Perusahaan bisnis, Startup, Dunia Hukum, Manajemen Pemasaran, Organisasi Politik/Publik, Perbankan.',
    smaRecommendations: {
      track: 'SMA - Jalur IPS / Ekonomi & Kewirausahaan',
      focusSubjects: ['Ekonomi', 'Sosiologi', 'Bahasa Inggris Lanjut', 'Geografi'],
      rationale: 'Mengasah wawasan roda ekonomi pasar, strategi manajemen, dan keterampilan komunikasi publik.'
    },
    smkRecommendations: {
      majors: [
        'Pemasaran Digital & Bisnis Ritel',
        'Manajemen Logistik',
        'Manajemen Perkantoran (OTKP)',
        'Acara & Event Management'
      ],
      rationale: 'Menggembleng kemampuan negosiasi penjualan, digital marketing, dan eksekusi event bisnis.'
    },
    universityMajors: [
      {
        category: 'Bisnis & Manajemen',
        majors: ['Manajemen Bisnis', 'Kewirausahaan (Entrepreneurship)', 'Pemasaran (Marketing)', 'Ilmu Ekonomi'],
        rationale: 'Mempelajari perencanaan strategi bisnis, analisis investasi, dan kepemimpinan korporat.'
      },
      {
        category: 'Hukum & Komunikasi',
        majors: ['Ilmu Hukum', 'Ilmu Komunikasi (Public Relations)', 'Hubungan Internasional'],
        rationale: 'Memperkuat teknik negosiasi hukum, diplomasi, dan pemengaruhan persepsi publik.'
      }
    ],
    careerProspects: [
      {
        title: 'Business Developer & Founder Startup',
        industry: 'Bisnis & Teknologi',
        description: 'Menciptakan peluang usaha baru, menjalin kemitraan strategi, dan memimpin pertumbuhan bisnis.'
      },
      {
        title: 'Digital Marketing Strategist',
        industry: 'Periklanan & Media',
        description: 'Merancang kampanye promosi produk untuk meyakinkan dan menarik pelanggan potensial.'
      },
      {
        title: 'Pengacara (Lawyer) & Konsultan Hukum',
        industry: 'Hukum',
        description: 'Membela hak klien di pengadilan dan bernegosiasi dalam penyelesaian kontrak bisnis.'
      }
    ]
  },
  C: {
    code: 'C',
    name: 'Conventional',
    titleIndo: 'Terstruktur, Rapi & Administrasi',
    characteristics: [
      'Menyukai pekerjaan dengan aturan yang jelas, terstruktur, dan teratur',
      'Teliti, cermat, rapi, serta berfokus pada ketepatan data dan dokumen',
      'Senang mengolah angka keuangan, pencatatan arsip, dan pembukuan',
      'Handal dalam menjaga konsistensi, kepatuhan (compliance), dan prosedur resmi'
    ],
    workStyle: 'Kantor administrasi, instansi pemerintah, lembaga perbankan, divisi akuntansi, dan pengolahan data.',
    smaRecommendations: {
      track: 'SMA - Jalur IPS (Fokus Akuntansi & Ekonomi Terstruktur)',
      focusSubjects: ['Ekonomi / Akuntansi', 'Matematika Terapan', 'Sosiologi', 'Informatika Dasar'],
      rationale: 'Membangun logika pembukuan angka, keteraturan logika laporan, dan kepatuhan sistem.'
    },
    smkRecommendations: {
      majors: [
        'Akuntansi & Keuangan Lembaga (AKL)',
        'Manajemen Perkantoran & Layanan Bisnis',
        'Perbankan Syariah / Konvensional',
        'Tata Kelola Logistik & Kearsipan Digital'
      ],
      rationale: 'Menyiapkan tenaga terampil dalam pembukuan keuangan, entri data, dan administrasi kantor otomatis.'
    },
    universityMajors: [
      {
        category: 'Akuntansi & Keuangan',
        majors: ['Akuntansi', 'Manajemen Keuangan', 'Perpajakan', 'Perbankan & Asuransi'],
        rationale: 'Keahlian tingkat tinggi dalam audit laporan keuangan, analisis pajak, dan regulasi moneter.'
      },
      {
        category: 'Administrasi & Informasi',
        majors: ['Administrasi Publik / Bisnis', 'Sistem Informasi Manajemen', 'Manajemen Informatika'],
        rationale: 'Mengelola tata kelola dokumen pemerintahan/swasta dan alur data operasional organisasi.'
      }
    ],
    careerProspects: [
      {
        title: 'Auditor & Akuntan Publik',
        industry: 'Keuangan & Audit',
        description: 'Memeriksa keakuratan laporan keuangan dan memastikan kepatuhan terhadap standar akuntansi.'
      },
      {
        title: 'Financial Planner & Tax Consultant',
        industry: 'Konsultasi Keuangan',
        description: 'Menyusun perencanaan anggaran keuangan serta perhitungan pajak wajib perorangan/badan.'
      },
      {
        title: 'Database Administrator & Specialist Ops',
        industry: 'Teknologi & Tata Kelola Data',
        description: 'Memastikan penyimpanan data sistem rapi, aman, dan mematuhi SOP keamanan data.'
      }
    ]
  }
};

export interface ComprehensiveRiasecAnalysis {
  hollandCode: string;
  dominantLetter: string;
  dominantDetail: RiasecDimensionDetail;
  scores: { R: number; I: number; A: number; S: number; E: number; C: number };
  sortedRankings: Array<{ code: string; name: string; score: number; percentage: number; detail: RiasecDimensionDetail }>;
  smaSmkRecommendations: {
    smaTracks: Array<{ track: string; focusSubjects: string[]; rationale: string }>;
    smkMajors: Array<{ name: string; rationale: string }>;
  };
  collegeMajorRecommendations: Array<{ category: string; majors: string[]; rationale: string }>;
  careerProspects: Array<{ title: string; industry: string; description: string }>;
  hollandSynthesisSummary: string;
}

// Function to generate complete comprehensive RIASEC identification and recommendation
export function generateComprehensiveRiasecAnalysis(
  scores: { R: number; I: number; A: number; S: number; E: number; C: number }
): ComprehensiveRiasecAnalysis {
  const maxScorePerDim = 25; // 5 items * max 5 points = 25
  
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([code, score]) => {
      const charCode = code as 'R'|'I'|'A'|'S'|'E'|'C';
      const detail = RIASEC_KNOWLEDGE_BASE[charCode];
      const percentage = Math.min(100, Math.round((score / maxScorePerDim) * 100));
      return {
        code: charCode,
        name: detail.name,
        score,
        percentage,
        detail
      };
    });

  const hollandCode = sorted.slice(0, 3).map(item => item.code).join('');
  const dominantLetter = sorted[0].code;
  const dominantDetail = sorted[0].detail;

  // Aggregate SMA/SMK recommendations from Top 2-3 dimensions
  const topDimensions = sorted.slice(0, 3);
  
  const smaTracksMap = new Map<string, { track: string; focusSubjects: Set<string>; rationale: string }>();
  const smkMajorsSet = new Set<{ name: string; rationale: string }>();
  const collegeMajorsList: Array<{ category: string; majors: string[]; rationale: string }> = [];
  const careerProspectsList: Array<{ title: string; industry: string; description: string }> = [];

  topDimensions.forEach((dim, idx) => {
    const d = dim.detail;
    // SMA
    if (!smaTracksMap.has(d.smaRecommendations.track)) {
      smaTracksMap.set(d.smaRecommendations.track, {
        track: d.smaRecommendations.track,
        focusSubjects: new Set(d.smaRecommendations.focusSubjects),
        rationale: d.smaRecommendations.rationale
      });
    } else {
      d.smaRecommendations.focusSubjects.forEach(s => smaTracksMap.get(d.smaRecommendations.track)?.focusSubjects.add(s));
    }

    // SMK
    d.smkRecommendations.majors.forEach(m => {
      smkMajorsSet.add({ name: m, rationale: `${d.name} (${d.titleIndo})` });
    });

    // University
    d.universityMajors.forEach(u => {
      collegeMajorsList.push(u);
    });

    // Careers
    d.careerProspects.forEach(c => {
      careerProspectsList.push(c);
    });
  });

  const smaTracks = Array.from(smaTracksMap.values()).map(item => ({
    track: item.track,
    focusSubjects: Array.from(item.focusSubjects),
    rationale: item.rationale
  }));

  // Unique SMK majors deduplicated
  const uniqueSmkMajors: Array<{ name: string; rationale: string }> = [];
  const seenSmk = new Set<string>();
  smkMajorsSet.forEach(item => {
    if (!seenSmk.has(item.name)) {
      seenSmk.add(item.name);
      uniqueSmkMajors.push(item);
    }
  });

  // Synthesis summary string
  const synthesis = `Peserta didik memiliki kombinasi profil Tipologi Holland **${hollandCode}** dengan dimensi paling dominan **${dominantDetail.name} (${dominantDetail.titleIndo})**. Profil ini menunjukkan potensi kuat pada ${dominantDetail.characteristics[0].toLowerCase()} serta ${topDimensions[1] ? topDimensions[1].detail.characteristics[0].toLowerCase() : ''}. Sangat direkomendasikan untuk diarahkan pada jenjang sekolah lanjutan dan pilihan karir yang menyeimbangkan antara aspek ${topDimensions.map(t => t.detail.titleIndo).join(', ')}.`;

  return {
    hollandCode,
    dominantLetter,
    dominantDetail,
    scores,
    sortedRankings: sorted,
    smaSmkRecommendations: {
      smaTracks,
      smkMajors: uniqueSmkMajors.slice(0, 7)
    },
    collegeMajorRecommendations: collegeMajorsList.slice(0, 5),
    careerProspects: careerProspectsList.slice(0, 6),
    hollandSynthesisSummary: synthesis
  };
}
