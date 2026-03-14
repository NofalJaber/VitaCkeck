import Navbar from '@/components/Navbar';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pb-8">
        {children}
      </main>
    </div>
  );
}
