import React from 'react';
import { ArrowRight, ShieldCheck, MessageSquare, Award, Calculator } from 'lucide-react';
import { Link } from '@/components/ui/link';
import { ROUTES } from '@/lib/routes';
import { CONTACT_CHANNELS } from '@/lib/contact';
import { normalizeCategory } from '@/lib/blog-engine';

interface Props {
  category: string;
}

export function ArticleContextualCta({ category }: Props) {
  const pillar = normalizeCategory(category);
  const isVisa = pillar === 'Golden Visa & Residency';

  return (
    <div className="rounded-3xl border border-[#0C2D48]/12 bg-[#FAFBFD] p-6 sm:p-8 shadow-sm my-10 relative overflow-hidden text-[#0C2D48]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-mono text-[10px] font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            DIRECT STATUTORY CONSULTATION
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-semibold text-[#0C2D48] tracking-tight">
            {isVisa
              ? 'Assess Your 10-Year UAE Golden Visa Eligibility'
              : 'Calculate Verified 2026 Company Formation Tariffs'}
          </h3>

          <p className="text-xs text-[#0C2D48]/70 leading-relaxed">
            {isVisa
              ? 'Pre-screen your executive eligibility criteria, real estate investments, and family residency quota with our sovereign desk.'
              : 'Generate an itemized first-year budget model across Dubai Mainland, Meydan, IFZA, and DMCC with zero hidden fees.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href={isVisa ? ROUTES.goldenVisa : ROUTES.costCalculator}
            className="px-5 py-3 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isVisa ? (
              <>
                <Award className="w-4 h-4 text-[#22C55E]" />
                <span>Pre-Screen Dossier</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 text-[#22C55E]" />
                <span>Open Tariff Simulator</span>
              </>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
          </Link>

          <a
            href={CONTACT_CHANNELS.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-white border border-[#0C2D48]/15 hover:border-[#16A34A] text-[#0C2D48] text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Chat via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
