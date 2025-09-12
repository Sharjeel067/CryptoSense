import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CryptoSense Dashboard",
  description: "Real-time cryptocurrency analysis and trading dashboard",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      {children}
    </div>
  );
}
