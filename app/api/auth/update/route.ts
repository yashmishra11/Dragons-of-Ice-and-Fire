import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  updateUser,
  findUserById,
  findUserByUsername,
  toSafeUser,
} from "@/lib/users";

export async function POST(req: Request) {
  return handleUpdate(req);
}

export async function PUT(req: Request) {
  return handleUpdate(req);
}

async function handleUpdate(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("citadel_session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let parsed: { userId: string } | null = null;
    try {
      parsed = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!parsed?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await findUserById(parsed.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { actualName, username, age, phone } = body;

    // Validate fields
    if (actualName && (typeof actualName !== "string" || actualName.trim().length < 2)) {
      return NextResponse.json(
        { error: "Actual name must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (username) {
      const cleanUsername = username.trim();
      if (!/^[a-zA-Z0-9_]{3,}$/.test(cleanUsername)) {
        return NextResponse.json(
          { error: "Username must be at least 3 alphanumeric characters or underscores." },
          { status: 400 }
        );
      }

      // If changing username, check if taken by someone else
      if (cleanUsername.toLowerCase() !== user.username.toLowerCase()) {
        const existing = await findUserByUsername(cleanUsername);
        if (existing && existing.id !== user.id) {
          return NextResponse.json(
            { error: "This display name / username is already taken." },
            { status: 400 }
          );
        }
      }
      user.username = cleanUsername;
    }

    if (age !== undefined) {
      const numAge = parseInt(age, 10);
      if (isNaN(numAge) || numAge < 1 || numAge > 150) {
        return NextResponse.json(
          { error: "Please provide a valid age." },
          { status: 400 }
        );
      }
      user.age = numAge;
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.trim().length < 7) {
        return NextResponse.json(
          { error: "Please provide a valid phone number." },
          { status: 400 }
        );
      }
      user.phone = phone.trim();
    }

    if (actualName) {
      user.actualName = actualName.trim();
    }

    user.updatedAt = new Date().toISOString();

    const updated = await updateUser(user.id, {
      actualName: user.actualName,
      username: user.username,
      age: user.age,
      phone: user.phone,
    });

    return NextResponse.json({
      success: true,
      user: toSafeUser(updated || user),
      message: "Citadel profile record updated successfully!",
    });
  } catch (error) {
    console.error("Error in /api/auth/update:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
