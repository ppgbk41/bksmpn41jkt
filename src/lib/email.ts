import nodemailer from 'nodemailer';

const BK_EMAIL_DESTINATION = process.env.BK_TEACHER_EMAIL || 'bksmpn41jkt@gmail.com';

export interface CounselingEmailPayload {
  registrationNo: string;
  studentName: string;
  nisn: string;
  className: string;
  bkTeacherName?: string;
  issueCategory: string;
  reason?: string;
  description: string;
  urgencyLevel: string;
  preferredDate: string;
  preferredTime: string;
  mode: string;
  phone?: string;
}

export async function sendBkRegistrationEmail(payload: CounselingEmailPayload) {
  const isUrgent = payload.urgencyLevel?.includes('Mendesak');
  const subject = `${isUrgent ? '🚨 [MENDESAK] ' : '📩 '} Pendaftaran Konseling Baru: ${payload.studentName} (${payload.className})`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">SMP NEGERI 41 JAKARTA</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Sistem Pelayanan Bimbingan dan Konseling</p>
      </div>

      <!-- Content Container -->
      <div style="padding: 24px;">
        <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
          <h2 style="margin-top: 0; font-size: 16px; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
            Notifikasi Pendaftaran Konseling Baru
          </h2>
          
          <p style="font-size: 13px; color: #475569; line-height: 1.5;">
            Halo Guru BK, terdapat pendaftaran konseling individu baru dari peserta didik dengan rincian sebagai berikut:
          </p>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 35%;">No. Registrasi:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${payload.registrationNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Nama Peserta Didik:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0284c7;">${payload.studentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">NISN:</td>
              <td style="padding: 8px 0; color: #0f172a;">${payload.nisn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Kelas:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">Kelas ${payload.className}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Guru BK Dituju:</td>
              <td style="padding: 8px 0; color: #0f172a;">${payload.bkTeacherName || 'Dra. Hj. Siti Aminah, M.Pd.'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Kategori Masalah:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${payload.issueCategory}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Tingkat Urgensi:</td>
              <td style="padding: 8px 0;">
                <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${
                  isUrgent
                    ? 'background-color: #fef2f2; color: #dc2626; border: 1px solid #fca5a5;'
                    : 'background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;'
                }">
                  ${payload.urgencyLevel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Jadwal Diajukan:</td>
              <td style="padding: 8px 0; color: #0f172a;">${payload.preferredDate} (${payload.preferredTime})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Mode Konseling:</td>
              <td style="padding: 8px 0; color: #0f172a;">${payload.mode}</td>
            </tr>
          </table>

          <div style="margin-top: 15px; padding: 12px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0284c7;">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #0f172a;">Gambaran Kondisi yang Dialami Siswa:</p>
            <p style="margin: 0; font-size: 12px; color: #334155; font-style: italic;">"${payload.description}"</p>
          </div>
        </div>

        <!-- Action Button -->
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://localhost:3000/layanan/konseling" 
             style="display: inline-block; padding: 12px 24px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);">
            Buka Dashboard Konseling & Setujui Jadwal →
          </a>
        </div>

        <!-- Footer -->
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
          Email notifikasi ini dikirimkan secara otomatis oleh Sistem Pelayanan BK SMPN 41 Jakarta ke alamat <strong>${BK_EMAIL_DESTINATION}</strong>.
        </p>
      </div>
    </div>
  `;

  // Check if SMTP credential variables are defined
  const smtpUser = process.env.SMTP_USER || 'bksmpn41jkt@gmail.com';
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpPass) {
    console.log('====================================================');
    console.log(`[SIMULASI NOTIFIKASI EMAIL GURU BK] Target: ${BK_EMAIL_DESTINATION}`);
    console.log(`Subjek: ${subject}`);
    console.log(`Pendaftaran: ${payload.registrationNo} - ${payload.studentName} (${payload.className})`);
    console.log(`Urgensi: ${payload.urgencyLevel} | Kategori: ${payload.issueCategory}`);
    console.log('Catatan: Untuk pengiriman nyata via Gmail SMTP, definisikan SMTP_PASS pada .env');
    console.log('====================================================');
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const info = await transporter.sendMail({
      from: `"Sistem BK SMPN 41 Jakarta" <${smtpUser}>`,
      to: BK_EMAIL_DESTINATION,
      subject: subject,
      html: htmlContent
    });

    console.log(`[EMAIL NOTIFIKASI TERKIRIM] Message ID: ${info.messageId} -> ${BK_EMAIL_DESTINATION}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Gagal mengirim email notifikasi BK:', error);
    return { success: false, error: error.message };
  }
}
