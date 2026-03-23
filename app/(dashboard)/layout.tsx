import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grid pb-20 lg:pb-4">
      <Navbar />
      <CommandPalette />
      <div className="mx-auto grid max-w-7xl gap-4 p-3 lg:grid-cols-[240px_1fr]">
        <Sidebar />
        <main>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
