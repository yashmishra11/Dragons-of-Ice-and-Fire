import { DragonChangeSubmission } from "@/types/submission";

export const submissions: DragonChangeSubmission[] = [
  {
    id: "sub-1",
    type: "edit-dragon",
    dragonId: "drogon",

    proposedChanges: {
      rider: "Daenerys Targaryen",
      died: "Not confirmed",
    },

    reason: "Some sources state Drogon did not die.",

    submittedBy: {
      userId: "user123",
      email: "user@example.com",
    },

    status: "pending",

    createdAt: new Date().toISOString(),

    // optional, but important for admin workflow
    reviewedAt: undefined,
  },
];
