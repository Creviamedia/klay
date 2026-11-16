import React from 'react';
import { Link } from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import { Calendar, ArrowRight, Clock, Award } from 'lucide-react';
import { getBlogArticleRoute } from '@/lib/routes';
import { estimateReadingTime, formatArticleDate } from '@/lib/blog-engine';
import type { BlogPostSummary } from '@/content/blog/types';

interface Props {
  article: BlogPostSummary;
}

export function EditorialHeroLead({ article }: Props) {
  const readingTime = estimateReadingTime(article.excerpt);
  const formattedDate = formatArticleDate(article.date);

  return (
    <div className="relative rounded-3xl border border-[#0C2D48]/12 bg-white overflow-hidden shadow-[0_20px_50px_rgba(12,45,72,0.06)] mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
        {/* Cover Image (6 cols) */}
        <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-full bg-[#05131F]/5 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#0C2D48]/10">
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            priority
            className="object-cover transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0C2D48]/90 text-white font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-sm">
              <Award className="w-3 h-3 text-[#22C55E]" />
              EDITORIAL LEAD BRIEFING
            </span>
          </div>
        </div>

        {/* Content (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#0C2D48]/60 mb-3">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                {formattedDate}
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readingTime}
              </span>
              <span>&bull;</span>
              <span className="text-[#16A34A] font-semibold">{article.category}</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-[#0C2D48] tracking-tight leading-snug mb-4">
              <Link
                href={getBlogArticleRoute(article.slug)}
                className="hover:text-[#16A34A] transition-colors"
              >
                {article.title}
              </Link>
            </h2>

            <p className="text-sm text-[#0C2D48]/75 leading-relaxed line-clamp-3 sm:line-clamp-4 mb-6">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-4 border-t border-[#0C2D48]/10 flex items-center justify-between">
            <div className="text-xs font-mono text-[#0C2D48]/60">
              Klay Corporate Structuring Desk
            </div>

            <Link
              href={getBlogArticleRoute(article.slug)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0C2D48] hover:bg-[#0C2D48]/90 text-white text-xs font-medium transition-all shadow-sm group"
            >
              <span>Read Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#22C55E] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
