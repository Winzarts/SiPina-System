import nodemailer from "nodemailer";

export const sendOtpEmail = async (email, otpCode, type) => {
  const isRegister = type === "register";
  const subject = isRegister 
    ? "[SiPina] Kode Verifikasi Pendaftaran Akun" 
    : "[SiPina] Kode Verifikasi Reset Password";
  
  const textContent = isRegister
    ? `Halo,\n\nTerima kasih telah mendaftar di SiPina. Kode verifikasi OTP Anda adalah: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jangan membagikan kode ini kepada siapapun.`
    : `Halo,\n\nAnda meminta reset password untuk akun Anda di SiPina. Kode verifikasi OTP Anda adalah: ${otpCode}\n\nKode ini berlaku selama 10 menit. Jika Anda tidak meminta ini, silakan abaikan email ini.`;

  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1ee; border-radius: 16px; background-color: #fcf8ff;">
      <h2 style="color: #3525cd; margin-bottom: 24px;">Verifikasi SiPina</h2>
      <p style="color: #1b1b24; font-size: 16px; line-height: 1.5;">
        ${isRegister ? "Terima kasih telah mendaftar di SiPina. Gunakan kode OTP di bawah ini untuk memverifikasi email Anda:" : "Kami menerima permintaan untuk mereset password akun SiPina Anda. Gunakan kode OTP di bawah ini untuk melanjutkan:"}
      </p>
      <div style="background-color: #f0ecf9; padding: 16px; border-radius: 12px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #3525cd;">${otpCode}</span>
      </div>
      <p style="color: #464555; font-size: 14px;">
        Kode ini berlaku selama 10 menit. Demi keamanan akun Anda, jangan sebarkan kode ini ke pihak mana pun.
      </p>
      <hr style="border: 0; border-top: 1px solid #c7c4d8; margin: 24px 0;" />
      <p style="color: #777587; font-size: 12px; text-align: center;">
        Sistem Peminjaman Inventaris Barang Sekolah (SiPina)
      </p>
    </div>
  `;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: SMTP_HOST,
        port: 587,
        secure: true, // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"SiPina Admin" <${SMTP_USER}>`,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[SMTP] Email OTP successfully sent to ${email}`);
      return true;
    } catch (error) {
      console.error("[SMTP] Error sending email via SMTP:", error);
      return false; // fallback to showing in console so it doesn't crash the server
    }
  } else {
    console.log("\n==================================================");
    console.log(`[OTP DEBUG] Sent OTP ${otpCode} (${type}) to ${email}`);
    console.log("==================================================\n");
    return true;
  }
};
