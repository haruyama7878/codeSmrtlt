import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./game-map.css";

export const metadata: Metadata = {
  title: "Smart Lotus | Toán học nở hoa",
  description: "Nền tảng học Toán lớp 1 thích ứng, giúp mỗi học sinh tiến bộ theo nhịp độ riêng.",
  applicationName: "Smart Lotus",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
