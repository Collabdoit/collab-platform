import type { Metadata } from "next";
import { Cairo, Poppins } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/variables.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chat/Chatbot";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Collab | نصنع الأثر... سوا",
  description: "المنصة السعودية الأولى لربط العلامات التجارية بالمؤثرين",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!['ar', 'en'].includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${cairo.variable} ${poppins.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 80px - 300px)' }}>
            {children}
          </main>
          <Footer />
          <Chatbot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
