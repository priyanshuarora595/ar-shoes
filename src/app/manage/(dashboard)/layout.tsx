import Link from 'next/link';
import { getCurrentManager } from '@/lib/managerApi';
import LogoutButton from '../LogoutButton';
import ViewSiteButton from '../ViewSiteButton';

export default async function ManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  const manager = await getCurrentManager();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-50">
      <header className="border-b border-zinc-900 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/manage/products" className="font-outfit text-sm font-bold tracking-tight text-white">
              AURA MANAGER
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-400">
              <Link href="/manage/products" className="hover:text-white transition-colors">
                Products
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ViewSiteButton />
            {manager && (
              <span className="text-xs text-zinc-500">
                {manager.username} &middot; {manager.isManager ? 'Manager' : 'Content Uploader'}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
