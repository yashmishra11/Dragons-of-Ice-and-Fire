import nodemailer from "nodemailer";

// In-memory OTP storage with 10-minute expiration attached to globalThis
interface OtpRecord {
  otp: string;
  expiresAt: number;
}

const globalForOtp = globalThis as unknown as {
  citadelOtpStore: Map<string, OtpRecord> | undefined;
};

export const otpStore =
  globalForOtp.citadelOtpStore ?? new Map<string, OtpRecord>();

globalForOtp.citadelOtpStore = otpStore;

const BREVO_SMTP_HOST =
  process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";

const BREVO_SMTP_PORT =
  Number(process.env.BREVO_SMTP_PORT) || 587;

const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY || "";

const BREVO_SMTP_USER = process.env.BREVO_SMTP_USER || "";

const BREVO_FROM_EMAIL =
  process.env.BREVO_FROM_EMAIL || "mr.yashofficial1102@gmail.com";

/**
 * Generates a random 6-digit numeric OTP and stores it.
 */
export function generateOtp(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, { otp: code, expiresAt });
  return code;
}

/**
 * Verifies the OTP for an email.
 */
export function verifyOtp(email: string, candidateOtp: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return false;
  }

  const isValid = record.otp.trim() === candidateOtp.trim();
  if (isValid) {
    otpStore.delete(cleanEmail); // Single use
  }
  return isValid;
}

/**
 * Sends the OTP email via Brevo SMTP with an antique Citadel theme.
 */
export async function sendOtpEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string; devOtpLogged?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();

  // Always log OTP to server terminal for instant inspection/dev fallback
  console.log("\n==================================================");
  console.log(`📜 [CITADEL RAVEN DISPATCH] Verification OTP for ${cleanEmail}: [ ${otp} ]`);
  console.log("==================================================\n");

  try {
    const transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false, // true for 465, false for 587 with STARTTLS
      auth: {
        user: BREVO_SMTP_USER,
        pass: BREVO_SMTP_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="background-color: #08070b; color: #f4ede4; font-family: 'Cinzel', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #78350f; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f59e0b; font-size: 24px; margin: 0; letter-spacing: 2px;">DRAGONS OF ICE & FIRE</h1>
          <p style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 4px;">Citadel Archmaester Registry</p>
        </div>
        
        <div style="background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
          <p style="font-size: 14px; line-height: 1.6; color: #e4e4e7;">
            A raven has arrived carrying the royal seal for your Citadel Scribe account.
          </p>
          
          <div style="margin: 28px 0;">
            <span style="display: inline-block; background: #451a03; border: 2px solid #f59e0b; color: #fef08a; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 12px 28px; border-radius: 12px; box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);">
              ${otp}
            </span>
          </div>

          <p style="font-size: 12px; color: #a1a1aa;">
            This seal remains valid for <strong>10 minutes</strong>. Never share this royal dispatch with any third party.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #71717a;">
          <p>The Citadel • Oldtown, Westeros • Seven Kingdoms Lore Repository</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"The Citadel Scribes" <${BREVO_FROM_EMAIL}>`,
      to: cleanEmail,
      subject: `📜 ${otp} is your Citadel Verification Seal — Dragons of Ice & Fire`,
      text: `Your Citadel verification seal is: ${otp}. It expires in 10 minutes.`,
      html: htmlContent,
    });

    console.log(`✅ Brevo SMTP email dispatched successfully to ${cleanEmail}`);
    return { success: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `⚠️ Brevo SMTP dispatch notice: ${errMessage}. Falling back to console OTP logging.`
    );
    // Even if SMTP relay rejected the username, OTP is valid in memory and logged above
    return { success: true, devOtpLogged: true };
  }
}

/**
 * Sends a sweet acknowledgment email to a member when an admin accepts their dragon lore contribution.
 */
export async function sendContributionAcknowledgementEmail({
  email,
  submitterName,
  dragonName,
  reason,
  changesSummary,
}: {
  email: string;
  submitterName: string;
  dragonName: string;
  reason?: string;
  changesSummary?: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  console.log("\n==================================================");
  console.log(`💌 [CITADEL ACKNOWLEDGEMENT RAVEN] Dispatched to ${cleanEmail} for dragon ${dragonName}`);
  console.log("==================================================\n");

  try {
    const transporter = nodemailer.createTransport({
      host: BREVO_SMTP_HOST,
      port: BREVO_SMTP_PORT,
      secure: false,
      auth: {
        user: BREVO_SMTP_USER,
        pass: BREVO_SMTP_KEY,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const htmlContent = `
      <div style="background-color: #08070b; color: #f4ede4; font-family: 'Cinzel', Georgia, serif; max-width: 620px; margin: 0 auto; padding: 36px; border: 2px solid #92400e; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8);">
        
        {/* Header */}
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="font-size: 32px; margin-bottom: 8px;">👑 🐉</div>
          <h1 style="color: #f59e0b; font-size: 24px; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
            The Citadel of Oldtown
          </h1>
          <p style="color: #a1a1aa; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin-top: 6px;">
            Archmaester Lore Repository • Seven Kingdoms
          </p>
        </div>

        {/* Parchment Message Box */}
        <div style="background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 28px; line-height: 1.7; font-family: Georgia, serif; font-size: 14px; color: #e4e4e7;">
          <p style="font-size: 16px; color: #fbbf24; font-family: 'Cinzel', Georgia, serif; margin-top: 0; font-weight: bold;">
            Hail, esteemed ${submitterName || "Citadel Scribe"}!
          </p>

          <p>
            A raven carrying the royal wax seal of the Archmaesters has arrived from Oldtown. Your proposed lore contribution for <strong style="color: #f59e0b;">${dragonName}</strong> has been carefully reviewed, verified against historical scrolls, and <strong>acknowledged with honor</strong> into the official Citadel Chronicles!
          </p>

          ${
            changesSummary
              ? `<div style="background: rgba(69, 26, 3, 0.35); border-left: 3px solid #f59e0b; padding: 12px 16px; margin: 18px 0; border-radius: 6px; font-size: 13px; color: #fde68a;">
                  <strong>Accepted Modifications:</strong><br/>
                  ${changesSummary}
                </div>`
              : ""
          }

          ${
            reason
              ? `<div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #10b981; padding: 12px 16px; margin: 18px 0; border-radius: 6px; font-size: 13px; color: #a7f3d0; font-style: italic;">
                  "${reason}"
                </div>`
              : ""
          }

          <p style="color: #e4e4e7;">
            The Archmaesters express their heartfelt gratitude for your sharp eyes, scholarly devotion, and passion for the true history of Westeros and House Targaryen. Because of your dedication, the annals of the realm shine ever brighter.
          </p>

          <p style="margin-bottom: 0; color: #fbbf24; font-family: 'Cinzel', Georgia, serif; font-size: 13px;">
            May the dragons of old forever watch over you.
          </p>
        </div>

        {/* Footer */}
        <div style="text-align: center; margin-top: 28px; font-size: 11px; color: #71717a;">
          <p style="margin: 0;">With warmest gratitude,</p>
          <p style="color: #d97706; font-weight: bold; margin-top: 4px; font-family: 'Cinzel', Georgia, serif;">
            The High Archmaester & Council of Citadel Scribes
          </p>
          <p style="color: #52525b; font-size: 10px; margin-top: 8px;">
            Oldtown, Westeros • Dragons of Ice & Fire Lore Repository
          </p>
        </div>

      </div>
    `;

    await transporter.sendMail({
      from: `"The Citadel Archmaesters" <${BREVO_FROM_EMAIL}>`,
      to: cleanEmail,
      subject: `📜 Acknowledged with Honor: Your Lore Contribution to ${dragonName} — Citadel Archives`,
      text: `Hail ${submitterName}! Your proposed lore contribution for ${dragonName} has been acknowledged and accepted with deepest gratitude by the High Archmaesters into the Citadel Chronicles. Thank you for enriching the history of Westeros!`,
      html: htmlContent,
    });

    console.log(`✅ Sweet acknowledgment raven delivered to ${cleanEmail}`);
    return { success: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️ Brevo acknowledgement notice: ${errMessage}`);
    return { success: false, error: errMessage || "Failed to dispatch email" };
  }
}

