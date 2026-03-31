import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="app-shell min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white pb-20 transition-colors dark:bg-slate-950 md:pb-8">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
