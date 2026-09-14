import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserById } from "@/lib/users";
import {
  getAllSubmissions,
  createSubmission,
} from "@/lib/submissions";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("citadel_session");
  if (!sessionCookie?.value) return null;
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (!parsed?.userId) return null;
    return findUserById(parsed.userId) || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");

    let all = getAllSubmissions();

    // If visitor, forbid or return empty
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If regular viewer (member), they can view submissions they submitted
    if (user.role !== "admin") {
      all = all.filter((s) => s.submittedBy.userId === user.id);
    }

    // Filter by status if provided
    if (statusParam && statusParam !== "all") {
      all = all.filter((s) => {
        if (statusParam === "submitted") return s.status === "submitted" || s.status === "pending";
        if (statusParam === "accepted") return s.status === "accepted" || s.status === "approved";
        if (statusParam === "discarded") return s.status === "discarded" || s.status === "rejected";
        return s.status === statusParam;
      });
    }

    return NextResponse.json({ success: true, submissions: all });
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to retrieve archives." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Only registered Citadel members can submit lore corrections." },
        { status: 401 }
      );
    }

    // Strict role check: Admins manage info directly, only members ('viewer') submit suggestions
    if (user.role !== "viewer") {
      return NextResponse.json(
        { error: "Admins possess direct editorial rights and do not use the suggestion queue." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { dragonId, dragonName, proposedChanges, reason } = body;

    if (!dragonId) {
      return NextResponse.json(
        { error: "Dragon ID is required." },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json(
        { error: "Please state a historical rationale / citation for this correction." },
        { status: 400 }
      );
    }

    if (!proposedChanges || Object.keys(proposedChanges).length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one modified lore field." },
        { status: 400 }
      );
    }

    const newSubmission = createSubmission({
      dragonId,
      dragonName,
      proposedChanges,
      reason: reason.trim(),
      submittedBy: {
        userId: user.id,
        username: user.username,
        actualName: user.actualName,
        email: user.email,
      },
    });

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      message: "Your lore correction has been submitted to the Citadel review queue.",
    });
  } catch (error: any) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to submit correction to the archives." },
      { status: 500 }
    );
  }
}
