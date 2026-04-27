'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ListChecks, FileText, User, LogOut, Zap, Menu, X,
  ChevronRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard',            label: 'Dashboard',  icon: LayoutDashboard, badge: null },
  { href: '/dashboard/onboarding', label: 'Onboarding', icon: ListChecks,       badge: null },
  { href: '/dashboard/documents',  label: 'Documents',  icon: FileText,         badge: null },
  { href: '/dashboard/profile',    label: 'Profile',    icon: User,             badge: null },
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

  const initials = `${client?.firstName?.[0] ?? ''}${client?.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ── */}
      <div className="px-6 py-5">
        <Link href="/dashboard" className="flex items-center gap-3 group" onClick={onNavClick}>
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0 group-hover:shadow-indigo-500/40 transition-shadow">
            <Zap className="w-[18px] h-[18px] text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="font-bold text-white text-[17px] tracking-tight leading-none block">ClientFlow</span>
            <span className="text-[10px] text-indigo-400/70 font-medium tracking-wider uppercase">Dashboard</span>
          </div>
        </Link>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-2" />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2 mt-1">Navigation</p>
        {navItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase()}`}
              onClick={onNavClick}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group ${
                isActive
                  ? 'nav-active-bar text-indigo-200 bg-indigo-500/10'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'bg-white/5 text-gray-500 group-hover:bg-white/8 group-hover:text-gray-300'
              }`}>
                <item.icon className="w-[16px] h-[16px]" />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Progress widget ── */}
      <div className="mx-3 mb-3">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-indigo-500/8 via-purple-500/5 to-transparent border border-indigo-500/15">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">Onboarding</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-400 tabular-nums">{progress}%</span>
          </div>
          <div className="w-full bg-white/8 rounded-full h-1.5 mb-2.5 overflow-hidden">
            <div
              className="progress-bar h-1.5 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-gray-500">{completedSteps} / {totalSteps} steps done</p>
            {progress < 100 && (
              <Link
                href="/dashboard/onboarding"
                onClick={onNavClick}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Continue →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      {/* ── User + Logout ── */}
      <div className="px-3 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
            <span className="text-[11px] font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{client?.firstName} {client?.lastName}</p>
            <p className="text-[11px] text-gray-500 truncate">{client?.email}</p>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile header bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3.5 glass-dark border-b border-white/6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-[15px] tracking-tight">ClientFlow</span>
        </Link>
        <button
          id="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Overlay ── */}
      <div
        className={`lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-[280px] sidebar-surface transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-[15px]">ClientFlow</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
            aria-label="Close menu"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="h-[calc(100%-64px)] overflow-y-auto">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </div>
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-[240px] min-h-screen flex-col sidebar-surface shrink-0 sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
