import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Sig Imobiliare Cluj",
  description:
    "Sig Imobiliare Cluj – agenție imobiliară în Cluj-Napoca. Apartamente, case și terenuri de vânzare sau închiriere.",
  applicationName: "Sig Imobiliare Cluj",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Sig Imobiliare Cluj",
    description:
      "Agenție imobiliară în Cluj-Napoca. Listări atent selectate, consultanță completă și tranzacții sigure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className="min-h-dvh bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
