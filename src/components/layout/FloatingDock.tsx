import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Calculator,
  Briefcase,
  Award,
  PhoneCall,
  MessageSquare,
  Building,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils';

export function FloatingDock() {
  const navigate = useNavigate();
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === ROUTES.home) {
      return location.pathname === '/' || location.pathname === ROUTES.home;
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      route: ROUTES.home,
      isSpecial: false,
    },
    {
      id: 'business-setup',
      label: 'Setup',
      icon: Building,
      route: ROUTES.businessSetup,
      isSpecial: false,
    },
    {
      id: 'services',
      label: 'Services',
      icon: Briefcase,
      route: ROUTES.services,
      isSpecial: false,
    },
    {
      id: 'golden-visa',
      label: 'Golden Visa',
      icon: Award,
      route: ROUTES.goldenVisa,
      isSpecial: true, // PROMINENT GOLDEN VISA ITEM
    },
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      route: ROUTES.costCalculator,
      isSpecial: false,
    },
    {
      id: 'contact',
      label: 'Consultation',
      icon: PhoneCall,
      route: ROUTES.contact,
      isSpecial: false,
    },
  ];

  return (
    <nav
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-20px)] sm:max-w-max"
      role="navigation"
      aria-label="Sovereign Quick Action Dock"
    >
      <div className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-full bg-[#05131F]/90 backdrop-blur-2xl border border-white/20 shadow-[0_16px_50px_rgba(0,0,0,0.65)] ring-1 ring-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.route);

          if (item.isSpecial) {
            // PROMINENT VIP GOLDEN VISA PILL
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className={cn(
                  'relative group flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all duration-300 font-sans',
                  'bg-gradient-to-r from-[#D4AF37]/25 via-[#E8A72E]/20 to-[#D4AF37]/25',
                  'border border-[#D4AF37]/70 text-[#F6DF98] shadow-[0_0_15px_rgba(212,175,55,0.25)]',
                  'hover:scale-105 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)]',
                  active && 'ring-2 ring-[#D4AF37] bg-[#D4AF37]/35 text-white'
                )}
                aria-label="UAE Golden Visa 10-Year Residency Advisory"
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8A72E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4AF37] animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#F6DF98] uppercase">
                  Golden Visa
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className={cn(
                'relative flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-white/15 text-[#22C55E] border border-[#22C55E]/40 shadow-[0_0_12px_rgba(34,197,94,0.2)]'
                  : 'text-white/75 hover:text-white hover:bg-white/10 border border-transparent'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-4 h-4 sm:w-4 sm:h-4 transition-colors',
                  active ? 'text-[#22C55E]' : 'text-white/70 group-hover:text-white'
                )}
              />
              <span className="hidden md:inline-block font-sans">{item.label}</span>
            </button>
          );
        })}

        {/* WhatsApp Direct Chat Quick Icon */}
        <div className="h-4 w-px bg-white/20 mx-0.5 hidden sm:block" />
        <button
          onClick={() => {
            window.open(
              'https://wa.me/971500000000?text=Hello%20Klay%20Consultants%2C%20I%20would%20like%20to%20discuss%20UAE%20company%20setup%20and%20Golden%20Visa.',
              '_blank',
              'noopener,noreferrer'
            );
          }}
          className="p-1.5 sm:p-2 rounded-full text-[#22C55E] hover:bg-[#22C55E]/15 hover:text-white transition-all duration-200"
          aria-label="Direct WhatsApp Advisory"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}

export default FloatingDock;
