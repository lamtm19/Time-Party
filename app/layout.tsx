import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka" });

export const metadata: Metadata = {
  title: "Time Party",
  description: "Le party game à jouer sur un seul téléphone : faites deviner, mimez, gagnez !",
  appleWebApp: { title: "Time Party" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover", // utilise tout l'écran, y compris autour de l'encoche
  themeColor: "#fbf6ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning : ignore les attributs ajoutés par les extensions du navigateur
    <html lang="fr" className={fredoka.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
