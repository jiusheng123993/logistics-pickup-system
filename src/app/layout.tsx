import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物流快递取件系统",
  description: "智能物流快递取件管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
