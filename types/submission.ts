import { Dragon } from "@/types/dragon";

export type SubmissionStatus = "pending" | "approved" | "rejected";
export type SubmissionType = "edit-dragon" | "add-dragon";

export interface DragonChangeSubmission {
  id: string;
  type: SubmissionType;

  dragonId: string;
  proposedChanges: Partial<import("./dragon").Dragon>;
  reason: string;

  submittedBy: {
    userId: string;
    email: string;
  };

  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
}
