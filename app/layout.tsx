// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'QuizMaster - Online Quiz Platform',
  description: 'Create and take quizzes online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar/>
          {children}
          <Footer/>
        </Providers>
      </body>
    </html>
  );
}
