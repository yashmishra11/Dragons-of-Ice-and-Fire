import { Dragon } from "@/types/dragon";

export type SubmissionStatus =
  | "submitted"
  | "accepted"
  | "discarded"
  | "pending"
  | "approved"
  | "rejected";

export type SubmissionType = "edit-dragon" | "add-dragon";

export interface SubmitterProfile {
  userId: string;
  username?: string;
  actualName?: string;
  email: string;
}

export interface DragonChangeSubmission {
  id: string;
  type: SubmissionType;
  dragonId: string;
  dragonName?: string;
  proposedChanges: Partial<Dragon>;
  reason: string;
  submittedBy: SubmitterProfile;
  status: SubmissionStatus;
  createdAt: string;
  reviewedAt?: string;
  acknowledgedAt?: string;
  discardedAt?: string;
  acknowledgementNote?: string;
}
