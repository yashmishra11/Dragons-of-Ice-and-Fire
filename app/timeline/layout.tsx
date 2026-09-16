import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historical Timeline & Targaryen Dynasties | Dragons of Ice & Fire",
  description:
    "Journey through the draconic dynasties of Westeros: from Aegon's Conquest and the Golden Age of Jaehaerys I to the Dance of the Dragons and the Dothraki Sea rebirth.",
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
