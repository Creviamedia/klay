import React, { useState } from 'react';
import {
  Landmark,
  Building2,
  BriefcaseBusiness,
  Sparkles,
  Users,
  Check,
  ShieldCheck,
  ArrowRight,
  Filter,
  Info,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';

interface MatrixRow {
  id: string;
  name: string;
  category: 'Asset' | 'Corporate' | 'Employment' | 'Innovation' | 'Academic';
  threshold: string;
  authority: string;
  timeline: string;
  complexity: 'Low' | 'Moderate' | 'High';
  familyScope: string;
  stayRestriction: string;
  popularFor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MATRIX_DATA: MatrixRow[] = [
  {
    id: 'real-estate',
    name: 'Real Estate Investor (AED 2M+)',
    category: 'Asset',
    threshold: 'AED 2,000,000 Equity (Ready or Off-Plan)',
    authority: 'Dubai Land Department (DLD) / Cube',
    timeline: '5–7 Business Days',
    complexity: 'Low',
    familyScope: 'Spouse, Sons of any age, Daughters, Domestic Staff',
    stayRestriction: 'Zero (Can stay outside UAE > 6 months)',
    popularFor: 'High-net-worth property owners & foreign buyers',
    icon: Landmark,
  },
  {
    id: 'business-investor',
    name: 'Corporate Founder & Shareholder',
    category: 'Corporate',
    threshold: 'AED 2,000,000 Capital or AED 250k Tax/yr',
    authority: 'ICP / GDRFA / Dept of Economy',
    timeline: '7–10 Business Days',
    complexity: 'Moderate',
    familyScope: 'Spouse, Children, Up to 3 Partners, Parents',
    stayRestriction: 'Zero (Can stay outside UAE > 6 months)',
    popularFor: 'Holding company directors & business founders',
    icon: Building2,
  },
  {
    id: 'executive-talent',
    name: 'Senior Executive & Professional',
    category: 'Employment',
    threshold: 'AED 30,000 / Month Basic Salary',
    authority: 'Ministry of Human Resources (MoHRE)',
    timeline: '3–5 Business Days',
    complexity: 'Low',
    familyScope: 'Spouse, Children, Dependent Parents',
    stayRestriction: 'Zero (Can stay outside UAE > 6 months)',
    popularFor: 'C-Suite leaders, Directors & Tech Leads',
    icon: BriefcaseBusiness,
  },
  {
    id: 'tech-entrepreneur',
    name: 'Tech Founder & Web3 Creator',
    category: 'Innovation',
    threshold: 'AED 500k Valuation or Incubator Letter',
    authority: 'Dubai Future Foundation / Incubators',
    timeline: '10–14 Business Days',
    complexity: 'Moderate',
    familyScope: 'Spouse, Children, 3 Technical Co-Founders',
    stayRestriction: 'Zero (Can stay outside UAE > 6 months)',
    popularFor: 'AI/Tech founders, scale-ups & serial entrepreneurs',
    icon: Sparkles,
  },
  {
    id: 'exceptional-talent',
    name: 'Outstanding Scholar & Specialist',
    category: 'Academic',
    threshold: 'GPA 3.8+ / Top 100 University / Healthcare',
    authority: 'Emirates Scientists Council / Dubai Culture',
    timeline: '7–12 Business Days',
    complexity: 'High',
    familyScope: 'Spouse, Children, Dependent Parents',
    stayRestriction: 'Zero (Can stay outside UAE > 6 months)',
    popularFor: 'Specialist physicians, researchers & elite grads',
    icon: Users,
  },
];

export function VariantB_Matrix() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Asset' | 'Corporate' | 'Employment' | 'Innovation'>('All');
  const [selectedRowId, setSelectedRowId] = useState<string>('real-estate');

  const filteredData = MATRIX_DATA.filter((row) => {
    if (activeFilter === 'All') return true;
    return row.category === activeFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Top Filter & Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#0C2D48]/10 shadow-sm">
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#16A34A] block">
            VARIANT B · COMPARATIVE STATUTORY MATRIX
          </span>
          <h3 className="text-lg sm:text-xl font-heading font-semibold text-[#0C2D48]">
            Side-by-Side UAE Golden Visa Pathway Comparison
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Asset', 'Corporate', 'Employment', 'Innovation'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-[#0C2D48] text-white shadow-sm'
                  : 'bg-[#0C2D48]/5 text-[#0C2D48]/70 hover:bg-[#0C2D48]/10'
              }`}
            >
              {filter === 'All' ? 'All Pathways (5)' : `${filter} Track`}
            </button>
          ))}
        </div>
      </div>

      {/* ================= DESKTOP COMPARATIVE TABLE ================= */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-[#0C2D48]/12 bg-white shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAFBFD] border-b border-[#0C2D48]/10 font-mono text-[11px] uppercase tracking-wider text-[#0C2D48]/70">
              <th className="py-4 px-6 font-semibold">Visa Pathway</th>
              <th className="py-4 px-5 font-semibold">Statutory Benchmark</th>
              <th className="py-4 px-5 font-semibold">Approving Authority</th>
              <th className="py-4 px-5 font-semibold">Filing Turnaround</th>
              <th className="py-4 px-5 font-semibold">Family Sponsorship</th>
              <th className="py-4 px-6 text-right font-semibold">Pre-Screening</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0C2D48]/8 text-xs">
            {filteredData.map((row) => {
              const Icon = row.icon;
              const isSelected = selectedRowId === row.id;
              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedRowId(row.id)}
                  className={`cursor-pointer transition-colors duration-150 ${
                    isSelected ? 'bg-[#22C55E]/5' : 'hover:bg-[#FAFBFD]'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-[#0C2D48] text-[#F6DF98]'
                            : 'bg-[#0C2D48]/5 text-[#0C2D48]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-heading font-semibold text-sm text-[#0C2D48] block">
                          {row.name}
                        </span>
                        <span className="text-[10px] text-[#0C2D48]/55 font-mono">
                          {row.popularFor}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 font-mono font-semibold text-[#0C2D48]">
                    {row.threshold}
                  </td>

                  <td className="py-4 px-5 text-[#0C2D48]/75">
                    {row.authority}
                  </td>

                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 font-mono font-medium text-[#0C2D48]">
                      <Clock className="w-3.5 h-3.5 text-[#16A34A]" /> {row.timeline}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-[#0C2D48]/75 max-w-[200px]">
                    {row.familyScope}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <a
                      href={`${ROUTES.contact}?topic=golden-visa&track=${row.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white font-mono text-[11px] font-semibold transition-all shadow-sm"
                    >
                      Pre-Check <ArrowRight className="w-3 h-3 text-[#22C55E]" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE RESPONSIVE CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
        {filteredData.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              className="p-5 rounded-2xl bg-white border border-[#0C2D48]/12 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0C2D48]/5 text-[#0C2D48] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-sm text-[#0C2D48]">{row.name}</h4>
                  <span className="text-[10px] font-mono text-[#0C2D48]/60">{row.authority}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs border-y border-[#0C2D48]/10 py-3">
                <div className="flex justify-between">
                  <span className="text-[#0C2D48]/60">Threshold:</span>
                  <span className="font-mono font-semibold text-[#0C2D48] text-right">{row.threshold}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0C2D48]/60">Timeline:</span>
                  <span className="font-mono text-[#16A34A] font-semibold">{row.timeline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#0C2D48]/60">Inclusions:</span>
                  <span className="text-[#0C2D48]/80 text-right">{row.familyScope}</span>
                </div>
              </div>

              <a
                href={`${ROUTES.contact}?topic=golden-visa&track=${row.id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0C2D48] text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <span>Verify Category Eligibility</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#22C55E]" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Matrix Footnote Guarantee */}
      <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#0C2D48]/10 flex items-center justify-between text-xs text-[#0C2D48]/70">
        <span className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          Every Golden Visa pathway processed by Klay is backed by an attested legal pre-clearance guarantee.
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-[#0C2D48]/50">
          Cabinet Resolution No. 65 (2022)
        </span>
      </div>
    </div>
  );
}

export default VariantB_Matrix;
