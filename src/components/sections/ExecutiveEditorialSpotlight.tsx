import React from 'react';
import { getFeaturedArticles, estimateReadingTime, formatArticleDate } from '@/lib/blog-engine';
import { getBlogArticleRoute, ROUTES } from '@/lib/routes';
import { Link } from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import { ArrowRight, BookOpen, Calendar, Clock, Sparkles } from 'lucide-react';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';

export function ExecutiveEditorialSpotlight() {
  const articles = getFeaturedArticles(3);

  return (
    <section className="py-20 lg:py-28 bg-[#FAFBFD] text-[#0C2D48] border-b border-[#0C2D48]/10 font-sans">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-mono text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              STATUTORY INTELLIGENCE &amp; RESEARCH
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-semibold text-[#0C2D48] tracking-tight">
              Executive Briefings &amp; Advisory Insights
            </h2>
            <p className="text-sm sm:text-base text-[#0C2D48]/70 mt-2 max-w-2xl leading-relaxed">
              Curated strategic counsel across UAE Corporate Tax, Golden Visa residency paths,
              banking compliance, and Mainland licensing.
            </p>
          </div>

          <Link
            href={ROUTES.blog}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#0C2D48]/15 bg-white hover:border-[#16A34A] text-[#0C2D48] hover:text-[#16A34A] text-xs font-medium transition-all shadow-sm shrink-0 self-start md:self-auto group"
          >
            <BookOpen className="w-4 h-4 text-[#16A34A]" />
            <span>View All 101 Briefings</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#16A34A] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {articles.map((article, idx) => {
            const readingTime = estimateReadingTime(article.excerpt);
            const formattedDate = formatArticleDate(article.date);
            const chapterNum = `0${idx + 1} //`;

            return (
              <Link
                key={article.slug}
                href={getBlogArticleRoute(article.slug)}
                className="group flex flex-col h-full rounded-2xl border border-[#0C2D48]/10 bg-white overflow-hidden shadow-sm hover:border-[#0C2D48]/30 hover:shadow-md transition-all relative"
              >
                <CornerCrosshairs color="text-[#22C55E]/40" size={10} />

                {/* Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#0C2D48]/5 border-b border-[#0C2D48]/10">
                  <Image
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0C2D48]/85 text-white font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#0C2D48]/50 mb-2.5">
                      <span className="text-[#16A34A] font-semibold">{chapterNum}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readingTime}
                      </span>
                    </div>

                    <h3 className="font-heading text-base sm:text-lg font-semibold text-[#0C2D48] leading-snug group-hover:text-[#16A34A] transition-colors line-clamp-2 mb-2.5">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#0C2D48]/70 leading-relaxed line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#0C2D48]/10 flex items-center justify-between text-xs font-medium text-[#0C2D48]">
                    <span className="font-mono text-[11px] text-[#0C2D48]/50 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#16A34A] group-hover:translate-x-1 transition-transform">
                      Read Briefing &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
