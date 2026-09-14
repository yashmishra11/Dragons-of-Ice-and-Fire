import fs from "fs";
import path from "path";
import { DragonChangeSubmission } from "@/types/submission";
import { Dragon } from "@/types/dragon";
import { sendContributionAcknowledgementEmail } from "@/lib/email";

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "submissions.json");
const DRAGONS_FILE = path.join(process.cwd(), "data", "dragons.json");

function ensureSubmissionsFile(): void {
  const dir = path.dirname(SUBMISSIONS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

export function getAllSubmissions(): DragonChangeSubmission[] {
  ensureSubmissionsFile();
  try {
    const raw = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading submissions.json:", error);
    return [];
  }
}

export function saveAllSubmissions(submissions: DragonChangeSubmission[]): void {
  ensureSubmissionsFile();
  fs.writeFileSync(
    SUBMISSIONS_FILE,
    JSON.stringify(submissions, null, 2),
    "utf-8"
  );
}

export function getSubmissionById(id: string): DragonChangeSubmission | undefined {
  const all = getAllSubmissions();
  return all.find((s) => s.id === id);
}

export function createSubmission(data: {
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
}): DragonChangeSubmission {
  const all = getAllSubmissions();

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

  all.unshift(newSub);
  saveAllSubmissions(all);
  return newSub;
}

/**
 * Acknowledges and accepts a submission:
 * 1. Sets status to 'accepted'
 * 2. Sets acknowledgedAt timestamp
 * 3. Applies the proposed changes to data/dragons.json
 * 4. Dispatches the sweet thank-you email to the contributor via Brevo SMTP
 */
export async function acknowledgeSubmission(id: string): Promise<{
  success: boolean;
  submission?: DragonChangeSubmission;
  emailSent?: boolean;
  error?: string;
}> {
  const all = getAllSubmissions();
  const subIndex = all.findIndex((s) => s.id === id);

  if (subIndex === -1) {
    return { success: false, error: "Submission not found" };
  }

  const sub = all[subIndex];
  sub.status = "accepted";
  sub.acknowledgedAt = new Date().toISOString();
  sub.reviewedAt = new Date().toISOString();

  // Apply proposed modifications to data/dragons.json
  applyChangesToDragon(sub.dragonId, sub.proposedChanges);

  all[subIndex] = sub;
  saveAllSubmissions(all);

  // Prepare summary of changed fields for the sweet email
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
export function discardSubmission(id: string): {
  success: boolean;
  submission?: DragonChangeSubmission;
  error?: string;
} {
  const all = getAllSubmissions();
  const subIndex = all.findIndex((s) => s.id === id);

  if (subIndex === -1) {
    return { success: false, error: "Submission not found" };
  }

  const sub = all[subIndex];
  sub.status = "discarded";
  sub.discardedAt = new Date().toISOString();
  sub.reviewedAt = new Date().toISOString();

  all[subIndex] = sub;
  saveAllSubmissions(all);

  return { success: true, submission: sub };
}

/**
 * Permanently purges a submission from data/submissions.json.
 */
export function deleteSubmissionPermanently(id: string): {
  success: boolean;
  error?: string;
} {
  const all = getAllSubmissions();
  const filtered = all.filter((s) => s.id !== id);

  if (filtered.length === all.length) {
    return { success: false, error: "Submission not found" };
  }

  saveAllSubmissions(filtered);
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
