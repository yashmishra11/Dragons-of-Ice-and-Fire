import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/users";
import { deleteSubmissionPermanently } from "@/lib/submissions";

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

async function handleDelete(id: string) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json(
      { error: "Only Archmaesters with Admin authority can permanently delete submissions." },
      { status: 403 }
    );
  }

  const result = deleteSubmissionPermanently(id);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Submission not found." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Submission permanently erased from the Citadel archives.",
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDelete(id);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDelete(id);
}
