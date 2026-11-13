import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagneticDock, type DockItemData } from '@/components/ui/magnetic-dock';
import {
  Home,
  Calculator,
  Briefcase,
  Award,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export function FloatingDock() {
  const navigate = useNavigate();
  const location = useLocation();

  const dockItems: DockItemData[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5 text-slate-800" />,
      onClick: () => navigate(ROUTES.home),
      isActive: location.pathname === '/' || location.pathname === ROUTES.home,
    },
    {
      id: 'calculator',
      label: 'Cost Calculator',
      icon: <Calculator className="w-5 h-5 text-emerald-600" />,
      onClick: () => navigate(ROUTES.costCalculator),
      isActive: location.pathname.includes('calculator'),
      badge: 1,
    },
    {
      id: 'services',
      label: 'Setup Services',
      icon: <Briefcase className="w-5 h-5 text-[#082C4B]" />,
      onClick: () => navigate(ROUTES.services),
      isActive: location.pathname.includes('services'),
    },
    {
      id: 'golden-visa',
      label: 'Golden Visa',
      icon: <Award className="w-5 h-5 text-amber-500" />,
      onClick: () => navigate(ROUTES.goldenVisa),
      isActive: location.pathname.includes('golden-visa'),
    },
    {
      id: 'contact',
      label: 'Contact Us',
      icon: <PhoneCall className="w-5 h-5 text-blue-600" />,
      onClick: () => navigate(ROUTES.contact),
      isActive: location.pathname.includes('contact'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Advisory',
      icon: <MessageSquare className="w-5 h-5 text-emerald-500" />,
      onClick: () => {
        window.open('https://wa.me/971500000000?text=Hello%20Klay%20Consultants%2C%20I%20would%20like%20to%20discuss%20a%20UAE%20company%20setup.', '_blank');
      },
    },
  ];

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden sm:block pointer-events-auto"
      role="navigation"
      aria-label="Quick Action Dock"
    >
      <div className="rounded-full p-1.5 bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_12px_40px_rgba(8,44,75,0.18)]">
        <MagneticDock
          items={dockItems}
          iconSize={38}
          maxScale={1.25}
          magneticDistance={120}
          showLabels={true}
          position="bottom"
          variant="transparent"
          className="bg-transparent border-0 shadow-none p-0"
        />
      </div>
    </div>
  );
}
