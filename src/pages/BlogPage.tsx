import React, { useState, useMemo, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogCard } from '@/components/ui/blog-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { BlogCategoryTabs } from '@/components/blog/BlogCategoryTabs';
import { BlogSearchBar } from '@/components/blog/BlogSearchBar';
import { EditorialHeroLead } from '@/components/blog/EditorialHeroLead';
import {
  getAllArticles,
  CATEGORY_PILLARS,
  normalizeCategory,
  type CategoryPillar,
} from '@/lib/blog-engine';
import type { BlogPostSummary } from '@/content/blog/types';
import { BLOG_POSTS_PER_PAGE, ROUTES } from '@/lib/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { BookOpen, Sparkles } from 'lucide-react';

const baselineArticles = getAllArticles();

function getCachedDynamicArticles(): BlogPostSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('klay_published_blogs');
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((b: any) => b && (b.status === 'published' || !b.status))
      .map((b: any) => ({
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || '',
        date: b.date || new Date().toISOString().split('T')[0],
        category: b.pillar || 'Company Setup & Strategy',
        image: b.coverImage || b.cover_image || '/images/blog/dubai-executive-at-sunset.webp',
        imageAlt: b.title,
        metaTitle: b.title,
        metaDescription: b.excerpt || '',
        focusKeyword: b.pillar || '',
      }));
  } catch {
    return [];
  }
}

export default function BlogPage() {
  const { page: pageParam } = useParams<{ page?: string }>();
  const [dynamicArticles, setDynamicArticles] =
    useState<BlogPostSummary[]>(getCachedDynamicArticles);

  useEffect(() => {
    let isMounted = true;
    async function loadRemoteBlogs() {
      try {
        const token =
          localStorage.getItem('klay_admin_token') || sessionStorage.getItem('klay_admin_token');
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/blogs', {
          headers,
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.blogs) && isMounted) {
            const published = data.blogs
              .filter((b: any) => b && (b.status === 'published' || !b.status))
              .map((b: any) => ({
                slug: b.slug,
                title: b.title,
                excerpt: b.excerpt || '',
                date: b.date || new Date().toISOString().split('T')[0],
                category: b.pillar || 'Company Setup & Strategy',
                image:
                  b.coverImage || b.cover_image || '/images/blog/dubai-executive-at-sunset.webp',
                imageAlt: b.title,
                metaTitle: b.title,
                metaDescription: b.excerpt || '',
                focusKeyword: b.pillar || '',
              }));
            setDynamicArticles(published);
            try {
              localStorage.setItem('klay_published_blogs', JSON.stringify(data.blogs));
            } catch {
              // Ignore
            }
          }
        }
      } catch {
        // Fallback to baseline + cached
      }
    }
    loadRemoteBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge dynamic articles on top of baseline (deduplicate by slug)
  const allArticles = useMemo(() => {
    const map = new Map<string, BlogPostSummary>();
    baselineArticles.forEach((a) => map.set(a.slug, a));
    dynamicArticles.forEach((a) => map.set(a.slug, a));

    return Array.from(map.values()).sort(
      (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)
    );
  }, [dynamicArticles]);

  const categoryPillars: CategoryPillar[] = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_PILLARS.forEach((p) => {
      counts[p] = 0;
    });
    counts['All Insights'] = allArticles.length;
    allArticles.forEach((a) => {
      const pillar = normalizeCategory(a.category, a.title, a.slug);
      if (counts[pillar] !== undefined) counts[pillar]++;
    });
    return CATEGORY_PILLARS.map((name) => ({
      id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      count: counts[name] || 0,
    }));
  }, [allArticles]);

  const leadArticle = allArticles[0];
  const pageCount = Math.max(1, Math.ceil(allArticles.length / BLOG_POSTS_PER_PAGE));

  let currentPage = 1;

  if (pageParam !== undefined) {
    if (!/^[1-9]\d*$/.test(pageParam)) return <NotFoundPage />;
    currentPage = Number(pageParam);
    if (currentPage === 1) return <Navigate to={ROUTES.blog} replace />;
    if (currentPage > pageCount) return <NotFoundPage />;
  }

  // Interactive filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('All Insights');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live filtered articles
  const filteredArticles = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    let base = allArticles;
    if (selectedCategory && selectedCategory !== 'All Insights') {
      base = allArticles.filter(
        (a) => normalizeCategory(a.category, a.title, a.slug) === selectedCategory
      );
    }
    if (!trimmed) return base;
    return base.filter((article) => {
      const titleMatch = article.title.toLowerCase().includes(trimmed);
      const excerptMatch = article.excerpt.toLowerCase().includes(trimmed);
      const keywordMatch = article.focusKeyword?.toLowerCase().includes(trimmed);
      const categoryMatch = article.category.toLowerCase().includes(trimmed);
      return titleMatch || excerptMatch || keywordMatch || categoryMatch;
    });
  }, [allArticles, searchQuery, selectedCategory]);

  const isFiltering = searchQuery.trim().length > 0 || selectedCategory !== 'All Insights';

  // When filtering, show all matches; when browsing page-by-page, slice according to page
  const displayArticles = isFiltering
    ? filteredArticles
    : allArticles.slice((currentPage - 1) * BLOG_POSTS_PER_PAGE, currentPage * BLOG_POSTS_PER_PAGE);

  return (
    <div className="bg-[#FAFBFD] text-[#0C2D48] font-sans min-h-screen">
      {/* =========================================================================
          EDITORIAL HERO HEADER
          ========================================================================= */}
      <section className="relative isolate overflow-hidden bg-[#0C2D48] pb-16 pt-32 text-white border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-green-horizon-glow opacity-30"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 border border-white/10 bg-white/[0.05] px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider text-[#22C55E]">
            <Sparkles className="h-3.5 w-3.5 text-[#22C55E]" />
            STATUTORY INTELLIGENCE &amp; ADVISORY DESK
          </div>
          <h1 className="font-heading text-3xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            UAE Commercial &amp;{' '}
            <span className="font-semibold text-white">Residency Briefings</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-white/70">
            Authoritative legal guides, statutory schedules, and structuring intelligence curated
            for European, UK, and global corporate founders.
          </p>
          {!isFiltering && currentPage > 1 && (
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[#22C55E]">
              PAGE {currentPage} OF {pageCount}
            </p>
          )}
        </div>
      </section>

      {/* =========================================================================
          MAIN PUBLICATIONS WORKSPACE
          ========================================================================= */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          {/* Top Editorial Lead Story (shown on Page 1 when not actively searching) */}
          {!isFiltering && currentPage === 1 && leadArticle && (
            <EditorialHeroLead article={leadArticle} />
          )}

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-[#0C2D48]/10 shadow-sm mb-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <BlogSearchBar
                query={searchQuery}
                onQueryChange={setSearchQuery}
                resultCount={filteredArticles.length}
              />
              <div className="text-xs font-mono text-[#0C2D48]/60 flex items-center gap-2 shrink-0">
                <BookOpen className="w-4 h-4 text-[#16A34A]" />
                <span>{allArticles.length} Published Briefings Verified</span>
              </div>
            </div>

            {/* Category Tabs */}
            <BlogCategoryTabs
              pillars={categoryPillars}
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Results Grid */}
          {displayArticles.length > 0 ? (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayArticles.map((post, index) => (
                <ScrollReveal key={post.slug} delay={(index % 3) * 50} className="h-full">
                  <BlogCard {...post} priority={false} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-2xl border border-[#0C2D48]/10 p-8">
              <div className="w-12 h-12 rounded-full bg-[#0C2D48]/5 text-[#0C2D48]/60 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-[#0C2D48]">
                No publications match your criteria
              </h3>
              <p className="text-xs text-[#0C2D48]/60 mt-1 max-w-sm mx-auto">
                Try searching with different terms or reset the category filter to view all
                insights.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Insights');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-[#0C2D48] text-white text-xs font-medium hover:bg-[#0C2D48]/90 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination Controls (when not filtering) */}
          {!isFiltering && (
            <div className="mt-14 border-t border-[#0C2D48]/10 pt-10">
              <BlogPagination currentPage={currentPage} pageCount={pageCount} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
