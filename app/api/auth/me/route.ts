import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById, toSafeUser } from "@/lib/users";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("citadel_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    let parsed: { userId: string } | null = null;
    try {
      parsed = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ user: null });
    }

    if (!parsed?.userId) {
      return NextResponse.json({ user: null });
    }

    const user = await findUserById(parsed.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ user: null });
  }
}
