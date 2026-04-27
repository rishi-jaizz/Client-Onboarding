'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ListChecks, FileText, User, LogOut, Zap, ChevronRight, Menu, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/onboarding', label: 'Onboarding', icon: ListChecks },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { client, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const completedSteps = client?.onboardingSteps?.filter(s => s.status === 'COMPLETED').length ?? 0;
  const totalSteps = client?.onboardingSteps?.length ?? 4;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onNavClick}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">ClientFlow</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              {item.label}
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-indigo-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Progress card */}
      <div className="px-4 mb-4">
        <div className="glass rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">Onboarding Progress</span>
            <span className="text-xs font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{completedSteps} of {totalSteps} steps complete</p>
        </div>
      </div>

      {/* User info + logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-1 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {client?.firstName?.[0]}{client?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{client?.firstName} {client?.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{client?.email}</p>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gray-950/95 backdrop-blur border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">ClientFlow</span>
        </Link>
        <button
          id="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4 border-b border-white/10">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100%-60px)] overflow-y-auto">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col bg-gray-900/50 border-r border-white/10 shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
