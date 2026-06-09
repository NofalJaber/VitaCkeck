import { LanguageProvider } from '@/context/LanguageContext';
import Navbar from '@/components/Navbar';

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>{children}</main>
      </div>
    </LanguageProvider>
  );
}