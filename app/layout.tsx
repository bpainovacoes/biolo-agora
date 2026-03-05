import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Biolo Agora - Serviços de Reparação",
  description: "Marketplace de serviços de reparação em Luanda",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-AO">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
