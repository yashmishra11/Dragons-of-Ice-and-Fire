import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/users";
import { discardSubmission } from "@/lib/submissions";

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("citadel_session");
  if (!sessionCookie?.value) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed?.userId) return null;
    const user = findUserById(parsed.userId);
    return user?.role === "admin" ? user : null;
  } catch {
    return null;
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: "Only Archmaesters with Admin authority can discard submissions." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const result = discardSubmission(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to discard submission." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: result.submission,
      message: "Submission discarded and moved to the Discarded section.",
    });
  } catch (error: any) {
    console.error("Error discarding submission:", error);
    return NextResponse.json(
      { error: "Server error while discarding submission." },
      { status: 500 }
    );
  }
}
