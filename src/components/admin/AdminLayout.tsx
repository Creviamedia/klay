import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Users, FileEdit, ExternalLink, LogOut, Shield, Loader2, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    localStorage.removeItem('klay_admin_token');
    sessionStorage.removeItem('klay_admin_token');

    async function verifySession() {
      try {
        const response = await fetch('/api/admin/leads?limit=1', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        });

        if (!isMounted) return;

        if (!response.ok) {
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
          return;
        }

        // Successfully authenticated
        const storedUser = localStorage.getItem('klay_admin_user');
        setAdminUser({ username: storedUser || 'admin' });
        setIsVerifying(false);
      } catch (err) {
        if (!isMounted) return;
        navigate('/admin/login', { replace: true });
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('klay_admin_user');
      localStorage.removeItem('klay_admin_token');
      sessionStorage.removeItem('klay_admin_token');
      navigate('/admin/login', { replace: true });
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#05131F] flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0C2D48] border border-[#D4AF37]/30 flex items-center justify-center shadow-xl shadow-black/40">
            <Shield className="w-8 h-8 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D4AF37]/20 to-[#0C2D48]/20 blur-md -z-10" />
        </div>
        <div className="flex items-center gap-2.5 text-[#FAFBFD] font-mono text-sm tracking-widest uppercase">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Verifying Sovereign Credentials...</span>
        </div>
        <p className="mt-2 text-xs text-white/40 font-mono">Klay Administrative Security Gateway</p>
      </div>
    );
  }

  const isLeadsActive = location.pathname.startsWith('/admin/leads');
  const isBlogsActive = location.pathname.startsWith('/admin/blogs');

  return (
    <div className="min-h-screen bg-[#05131F] text-[#FAFBFD] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-[#FAFBFD]">
      {/* Sovereign Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#05131F]/95 backdrop-blur-md border-b border-[#0C2D48] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Brand & Portal Title */}
          <div className="flex items-center gap-6">
            <Link to="/admin/leads" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-[#0C2D48] border border-[#D4AF37]/40 flex items-center justify-center group-hover:border-[#D4AF37] transition-colors shadow-sm">
                <span className="font-serif font-bold text-sm tracking-wider text-[#D4AF37]">
                  KC
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold tracking-wide text-white flex items-center gap-2">
                  KLAY
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-widest">
                    Executive Portal
                  </span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              <Link
                to="/admin/leads"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isLeadsActive
                    ? 'bg-[#0C2D48] text-[#D4AF37] border border-[#D4AF37]/30 shadow-inner'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Leads Ingestion</span>
              </Link>

              <Link
                to="/admin/blogs"
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isBlogsActive
                    ? 'bg-[#0C2D48] text-[#D4AF37] border border-[#D4AF37]/30 shadow-inner'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Blog Studio</span>
              </Link>
            </nav>
          </div>

          {/* Right Action Toolbar */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/60 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              title="View Public Site in New Tab"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-white/40" />
            </a>

            <div className="h-4 w-px bg-white/10" />

            {/* User Badge */}
            <div className="flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#0C2D48]/60 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] ring-2 ring-[#22C55E]/20" />
              <span className="font-mono text-white/90 font-medium">
                {adminUser?.username || 'admin'}
              </span>
            </div>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
              title="Sign Out of Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#0C2D48] space-y-1">
            <Link
              to="/admin/leads"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono ${
                isLeadsActive
                  ? 'bg-[#0C2D48] text-[#D4AF37] font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Leads Ingestion</span>
            </Link>

            <Link
              to="/admin/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-mono ${
                isBlogsActive
                  ? 'bg-[#0C2D48] text-[#D4AF37] font-semibold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileEdit className="w-4 h-4" />
              <span>Blog Studio</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono text-white/60 hover:text-white"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-3">
              <span className="font-mono text-xs text-white/60">
                User: {adminUser?.username || 'admin'}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-rose-300"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children || <Outlet />}
      </main>
    </div>
  );
}

export default AdminLayout;
