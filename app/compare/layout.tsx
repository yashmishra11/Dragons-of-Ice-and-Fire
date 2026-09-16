import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dragon Comparator & Scale Battle Records | Dragons of Ice & Fire",
  description:
    "Side-by-side visual and statistical comparator contrasting scales, wingspans, eras, and riders between legendary dragons of Westeros.",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
