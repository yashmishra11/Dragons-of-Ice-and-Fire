import { NextResponse } from "next/server";
import {
  findUserByUsername,
  findUserByEmail,
  verifyPassword,
  toSafeUser,
} from "@/lib/users";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Please provide both username and password." },
        { status: 400 }
      );
    }

    const cleanInput = username.trim();
    // Allow login via username or email
    const user =
      (await findUserByUsername(cleanInput)) || (await findUserByEmail(cleanInput));

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid username or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const safeUser = toSafeUser(user);

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome back, ${user.actualName || user.username}!`,
    });

    response.cookies.set("citadel_session", JSON.stringify({ userId: user.id }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in /api/auth/login:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
