import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { generateOtp, sendOtpEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    const otp = generateOtp(cleanEmail);
    const result = await sendOtpEmail(cleanEmail, otp);

    return NextResponse.json({
      success: true,
      message: "Verification raven dispatched to your email.",
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      devNotice: result.devOtpLogged
        ? "Brevo relay notice: check server console for OTP."
        : undefined,
    });
  } catch (error) {
    console.error("Error in /api/auth/send-otp:", error);
    return NextResponse.json(
      { error: "Failed to dispatch verification email. Please try again." },
      { status: 500 }
    );
  }
}
