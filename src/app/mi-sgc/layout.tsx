'use client';

import { MiSGCSidebar } from '@/components/layout/MiSGCSidebar';

export default function MiSGCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <MiSGCSidebar />
      <main className="flex-1 overflow-auto">
        <div className="w-full px-4 sm:px-6 lg:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
