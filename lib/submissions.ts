import fs from "fs";
import path from "path";
import { DragonChangeSubmission } from "@/types/submission";
import { Dragon } from "@/types/dragon";
import { sendContributionAcknowledgementEmail } from "@/lib/email";
import {
  isDatabaseConfigured,
  dbGetAllSubmissions,
  dbGetSubmissionById,
  dbCreateSubmission,
  dbUpdateSubmissionStatus,
  dbDeleteSubmission,
} from "@/lib/db";

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "submissions.json");
const DRAGONS_FILE = path.join(process.cwd(), "data", "dragons.json");

function ensureSubmissionsFile(): void {
  try {
    const dir = path.dirname(SUBMISSIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch {
    // Non-fatal if filesystem is read-only (e.g. Vercel)
  }
}

function getLocalSubmissions(): DragonChangeSubmission[] {
  ensureSubmissionsFile();
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalSubmissions(submissions: DragonChangeSubmission[]): void {
  ensureSubmissionsFile();
  try {
    fs.writeFileSync(
      SUBMISSIONS_FILE,
      JSON.stringify(submissions, null, 2),
      "utf-8"
    );
  } catch {
    // Non-fatal in read-only environment
  }
}

export async function getAllSubmissions(): Promise<DragonChangeSubmission[]> {
  if (isDatabaseConfigured()) {
    try {
      const submissions = await dbGetAllSubmissions();
      if (submissions.length > 0) return submissions;
    } catch (error) {
      console.error("Database query failed in getAllSubmissions:", error);
    }
  }
  return getLocalSubmissions();
}

export async function saveAllSubmissions(submissions: DragonChangeSubmission[]): Promise<void> {
  saveLocalSubmissions(submissions);
}

export async function getSubmissionById(id: string): Promise<DragonChangeSubmission | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const sub = await dbGetSubmissionById(id);
      if (sub) return sub;
    } catch (error) {
      console.error("Database query failed in getSubmissionById:", error);
    }
  }
  const all = getLocalSubmissions();
  return all.find((s) => s.id === id);
}

export async function createSubmission(data: {
  dragonId: string;
  dragonName?: string;
  proposedChanges: Partial<Dragon>;
  reason: string;
  submittedBy: {
    userId: string;
    username?: string;
    actualName?: string;
    email: string;
  };
}): Promise<DragonChangeSubmission> {
  const newSub: DragonChangeSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    type: "edit-dragon",
    dragonId: data.dragonId,
    dragonName: data.dragonName || data.dragonId,
    proposedChanges: data.proposedChanges,
    reason: data.reason,
    submittedBy: data.submittedBy,
    status: "submitted",
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured()) {
    try {
      await dbCreateSubmission(newSub);
    } catch (error) {
      console.error("Database insert failed in createSubmission:", error);
    }
  }

  const all = getLocalSubmissions();
  all.unshift(newSub);
  saveLocalSubmissions(all);

  return newSub;
}

/**
 * Acknowledges and accepts a submission:
 * 1. Sets status to 'accepted'
 * 2. Sets acknowledgedAt timestamp in DB and local store
 * 3. Applies the proposed changes to data/dragons.json
 * 4. Dispatches acknowledgment email to the contributor
 */
export async function acknowledgeSubmission(id: string): Promise<{
  success: boolean;
  submission?: DragonChangeSubmission;
  emailSent?: boolean;
  error?: string;
}> {
  const sub = await getSubmissionById(id);

  if (!sub) {
    return { success: false, error: "Submission not found" };
  }

  const acknowledgedAt = new Date().toISOString();
  const reviewedAt = acknowledgedAt;

  sub.status = "accepted";
  sub.acknowledgedAt = acknowledgedAt;
  sub.reviewedAt = reviewedAt;

  if (isDatabaseConfigured()) {
    try {
      await dbUpdateSubmissionStatus(id, "accepted", {
        acknowledgedAt,
        reviewedAt,
      });
    } catch (error) {
      console.error("Database update failed in acknowledgeSubmission:", error);
    }
  }

  // Also update local copy
  const all = getLocalSubmissions();
  const subIndex = all.findIndex((s) => s.id === id);
  if (subIndex !== -1) {
    all[subIndex] = sub;
    saveLocalSubmissions(all);
  }

  // Apply proposed modifications to data/dragons.json
  applyChangesToDragon(sub.dragonId, sub.proposedChanges);

  // Prepare summary of changed fields for the email
  const changesSummary = Object.entries(sub.proposedChanges)
    .map(([key, val]) => `• ${key}: "${val}"`)
    .join("<br/>");

  const emailRes = await sendContributionAcknowledgementEmail({
    email: sub.submittedBy.email,
    submitterName:
      sub.submittedBy.username || sub.submittedBy.actualName || "Citadel Scribe",
    dragonName: sub.dragonName || sub.dragonId,
    reason: sub.reason,
    changesSummary,
  });

  return {
    success: true,
    submission: sub,
    emailSent: emailRes.success,
  };
}

/**
 * Discards a submission (moves it to the discarded section).
 */
export async function discardSubmission(id: string): Promise<{
  success: boolean;
  submission?: DragonChangeSubmission;
  error?: string;
}> {
  const sub = await getSubmissionById(id);

  if (!sub) {
    return { success: false, error: "Submission not found" };
  }

  const discardedAt = new Date().toISOString();
  const reviewedAt = discardedAt;

  sub.status = "discarded";
  sub.discardedAt = discardedAt;
  sub.reviewedAt = reviewedAt;

  if (isDatabaseConfigured()) {
    try {
      await dbUpdateSubmissionStatus(id, "discarded", {
        reviewedAt,
      });
    } catch (error) {
      console.error("Database update failed in discardSubmission:", error);
    }
  }

  const all = getLocalSubmissions();
  const subIndex = all.findIndex((s) => s.id === id);
  if (subIndex !== -1) {
    all[subIndex] = sub;
    saveLocalSubmissions(all);
  }

  return { success: true, submission: sub };
}

/**
 * Permanently purges a submission from database and data/submissions.json.
 */
export async function deleteSubmissionPermanently(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (isDatabaseConfigured()) {
    try {
      await dbDeleteSubmission(id);
    } catch (error) {
      console.error("Database delete failed in deleteSubmissionPermanently:", error);
    }
  }

  const all = getLocalSubmissions();
  const filtered = all.filter((s) => s.id !== id);

  saveLocalSubmissions(filtered);
  return { success: true };
}

/**
 * Updates data/dragons.json with approved modifications.
 */
function applyChangesToDragon(
  dragonId: string,
  changes: Partial<Dragon>
): void {
  try {
    if (!fs.existsSync(DRAGONS_FILE)) return;
    const raw = fs.readFileSync(DRAGONS_FILE, "utf-8");
    const dragons: Dragon[] = JSON.parse(raw);

    const dIndex = dragons.findIndex(
      (d) =>
        d.id.toLowerCase() === dragonId.toLowerCase() ||
        d.name.toLowerCase() === dragonId.toLowerCase()
    );

    if (dIndex !== -1) {
      dragons[dIndex] = {
        ...dragons[dIndex],
        ...changes,
      };
      fs.writeFileSync(DRAGONS_FILE, JSON.stringify(dragons, null, 2), "utf-8");
      console.log(`✅ Applied approved changes to dragon: ${dragons[dIndex].name}`);
    }
  } catch (err) {
    console.error("Error patching dragons.json:", err);
  }
}
