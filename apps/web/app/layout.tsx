import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Rallx Wealth", description: "A clearer view of your wealth." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
