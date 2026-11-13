import { Navigate, useParams } from 'react-router-dom';
import { BlogPagination } from '@/components/blog/BlogPagination';
import { BlogCard } from '@/components/ui/blog-card';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { BLOG_POSTS } from '@/content/blog';
import { BLOG_POSTS_PER_PAGE, ROUTES } from '@/lib/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Newest first; posts with the same date keep their order in posts.ts.
const publishedArticles = BLOG_POSTS
  .map((post, index) => ({ post, index, time: Date.parse(post.date) || 0 }))
  .sort((a, b) => b.time - a.time || a.index - b.index)
  .map(({ post }) => post);

const pageCount = Math.max(1, Math.ceil(publishedArticles.length / BLOG_POSTS_PER_PAGE));

export default function BlogPage() {
  // Undefined on /blog/; set on /blog/page/:page.
  const { page: pageParam } = useParams<{ page?: string }>();
  let currentPage = 1;
  if (pageParam !== undefined) {
    if (!/^[1-9]\d*$/.test(pageParam)) return <NotFoundPage />;
    currentPage = Number(pageParam);
    if (currentPage === 1) return <Navigate to={ROUTES.blog} replace />;
    if (currentPage > pageCount) return <NotFoundPage />;
  }

  const firstIndex = (currentPage - 1) * BLOG_POSTS_PER_PAGE;
  const pageArticles = publishedArticles.slice(firstIndex, firstIndex + BLOG_POSTS_PER_PAGE);

  return (
    <div className="bg-[#FBFBFB] text-[#0C2D48]">
      {/* Editorial Header */}
      <section className="relative isolate overflow-hidden bg-[#05131F] pb-16 pt-32 text-white border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-green-horizon-glow opacity-50"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#22C55E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            Regulatory Publications &amp; Briefings
          </div>
          <h1 className="font-heading text-4xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            UAE Commercial &amp; <span className="font-semibold text-white">Residency Insights</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Practical legal guides, statutory updates, and strategic intelligence to help you navigate business setup and residency in the UAE.
          </p>
          {currentPage > 1 && (
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#22C55E]">
              PAGE {currentPage} OF {pageCount}
            </p>
          )}
        </div>
      </section>

      {/* Publications Grid */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
          <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageArticles.map((post, index) => (
              <ScrollReveal key={post.slug} delay={(index % 3) * 70} className="h-full">
                <BlogCard {...post} priority={index === 0} />
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-14 border-t border-[#0C2D48]/10 pt-10">
            <BlogPagination currentPage={currentPage} pageCount={pageCount} />
          </div>
        </div>
      </section>
    </div>
  );
}
