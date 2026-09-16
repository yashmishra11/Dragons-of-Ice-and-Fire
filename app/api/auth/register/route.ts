import { NextResponse } from "next/server";
import {
  createUser,
  findUserByUsername,
  findUserByEmail,
  hashPassword,
  doesPasswordContainActualName,
  isAlphanumeric,
  toSafeUser,
} from "@/lib/users";
import { verifyOtp } from "@/lib/email";
import { CitadelUser } from "@/types/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actualName, username, age, email, phone, password, otp } = body;

    // 1. Basic field presence
    if (!actualName || typeof actualName !== "string" || actualName.trim().length < 2) {
      return NextResponse.json(
        { error: "Please provide your actual name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores." },
        { status: 400 }
      );
    }

    // 2. Uniqueness check for username
    const existingUsername = await findUserByUsername(cleanUsername);
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken. Please choose another display name." },
        { status: 400 }
      );
    }

    // 3. Age validation
    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 1 || numAge > 150) {
      return NextResponse.json(
        { error: "Please provide a valid age." },
        { status: 400 }
      );
    }

    // 4. Email validation & OTP check
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingEmail = await findUserByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // 5. Phone validation
    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 400 }
      );
    }

    // 6. Password rules:
    // - Alphanumeric (letters + numbers)
    // - Cannot contain actual name
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!isAlphanumeric(password)) {
      return NextResponse.json(
        { error: "Password must be alphanumeric (must contain both letters and numbers, with no special symbols)." },
        { status: 400 }
      );
    }

    if (doesPasswordContainActualName(password, actualName)) {
      return NextResponse.json(
        { error: "For security, your password cannot contain your actual name." },
        { status: 400 }
      );
    }

    // 7. OTP verification
    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { error: "Please enter the 6-digit verification code sent to your email." },
        { status: 400 }
      );
    }

    const isOtpValid = verifyOtp(cleanEmail, otp);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification seal (OTP). Please request a new one." },
        { status: 400 }
      );
    }

    // 7. Create user with default role: 'viewer' (member)
    const newUser: CitadelUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      actualName: actualName.trim(),
      username: cleanUsername,
      age: numAge,
      email: cleanEmail,
      phone: phone.trim(),
      role: "viewer", // default role is viewer/member
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createUser(newUser);

    const safeUser = toSafeUser(newUser);

    // Create response and set cookie
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: "Citadel Scribe account created successfully!",
    });

    response.cookies.set("citadel_session", JSON.stringify({ userId: newUser.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in /api/auth/register:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
