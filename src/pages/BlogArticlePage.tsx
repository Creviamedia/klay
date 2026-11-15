import React, { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { LongFormArticleContent } from '@/components/blog/LongFormArticleContent';
import { MarkdownArticleContent } from '@/components/blog/MarkdownArticleContent';
import { ArticleShareDock } from '@/components/blog/ArticleShareDock';
import { ArticleTableOfContents } from '@/components/blog/ArticleTableOfContents';
import { ArticleContextualCta } from '@/components/blog/ArticleContextualCta';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { Image } from '@/components/ui/image';
import { Link } from '@/components/ui/link';
import {
  BLOG_REDIRECTS,
  getBlogPost,
  loadBlogArticle,
  type BlogArticle,
  type BlogPostSummary,
} from '@/content/blog';
import { CONTACT_CHANNELS } from '@/lib/contact';
import { getBlogArticleRoute } from '@/lib/routes';
import { estimateReadingTime, formatArticleDate } from '@/lib/blog-engine';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ArrowLeft, Calendar, Clock, ShieldCheck, UserCheck } from 'lucide-react';

type ArticleViewProps = { post: BlogPostSummary };

// One lazy component per article so only the article being read is downloaded.
// During prerendering the server waits for it, so the full text is in the HTML.
const articleViews = new Map<string, ComponentType<ArticleViewProps>>();

function getArticleView(slug: string): ComponentType<ArticleViewProps> | undefined {
  const cached = articleViews.get(slug);
  if (cached) return cached;
  const pending = loadBlogArticle(slug);
  if (!pending) return undefined;
  const View = lazy(() =>
    pending.then((article) => ({
      default: ({ post }: ArticleViewProps) => <ArticleLayout post={post} article={article} />,
    }))
  );
  articleViews.set(slug, View);
  return View;
}

function trimSlash(path: string) {
  return path.replace(/\/+$/, '') || '/';
}

export default function BlogArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { pathname } = useLocation();

  const redirectTarget = BLOG_REDIRECTS[slug];
  if (redirectTarget) return <Navigate to={getBlogArticleRoute(redirectTarget)} replace />;

  const post = getBlogPost(slug);
  const ArticleView = post ? getArticleView(post.slug) : undefined;
  if (!post || !ArticleView) return <NotFoundPage />;

  const canonicalPath = getBlogArticleRoute(post.slug);
  if (trimSlash(pathname) !== trimSlash(canonicalPath))
    return <Navigate to={canonicalPath} replace />;

  return (
    <Suspense fallback={<ArticleLayout post={post} />}>
      <ArticleView post={post} />
    </Suspense>
  );
}

function ArticleLayout({ post, article }: { post: BlogPostSummary; article?: BlogArticle }) {
  const details = article?.details;
  const body = article?.body;
  const readingTime = estimateReadingTime(post.excerpt);
  const formattedDate = formatArticleDate(post.date);

  return (
    <div className="relative z-[1] bg-[#FAFBFD] text-[#0C2D48] font-sans">
      <article className="pb-20 pt-28 sm:pt-36">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Top Breadcrumb & Return Link */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-[#0C2D48]/60 transition-colors hover:text-[#16A34A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Publications Hub
          </Link>

          {/* Article Header Metadata */}
          <div className="max-w-4xl space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[#16A34A]/30 bg-[#16A34A]/10 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider text-[#16A34A]">
                {post.category}
              </span>
              <span className="text-xs font-mono text-[#0C2D48]/50 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {readingTime}
              </span>
              <span className="text-[#0C2D48]/30">&bull;</span>
              <span className="text-xs font-mono text-[#0C2D48]/50 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#0C2D48] leading-tight">
              {post.title}
            </h1>

            {/* Author Credential Chip */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-8 h-8 rounded-full bg-[#0C2D48] text-white flex items-center justify-center font-mono text-xs font-bold">
                KC
              </div>
              <div className="text-xs">
                <span className="font-semibold text-[#0C2D48] block">
                  Klay Structuring Advisory Desk
                </span>
                <span className="text-[#0C2D48]/60 font-mono text-[10px]">
                  Verified Statutory Regulatory Counsel
                </span>
              </div>
            </div>

            {/* Tags */}
            {details?.tags && (
              <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Article tags">
                {details.tags.map((tag) => (
                  <span
                    key={tag}
                    className="border border-[#0C2D48]/10 bg-white px-2.5 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider text-[#0C2D48]/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Share Dock */}
          <ArticleShareDock title={post.title} />

          {/* Cover Image */}
          {post.image && (
            <figure className="relative my-8 border border-[#0C2D48]/12 bg-white rounded-3xl p-3 shadow-sm overflow-hidden max-w-5xl">
              <CornerCrosshairs color="text-[#22C55E]/40" size={12} />
              <div className="overflow-hidden rounded-2xl bg-[#05131F]/5 max-h-[480px]">
                <Image
                  src={post.image}
                  alt={post.imageAlt ?? post.title}
                  title={details?.imageTitle}
                  aria-describedby={
                    details?.imageDescription ? 'article-image-description' : undefined
                  }
                  width={1600}
                  height={900}
                  priority
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 1152px"
                />
              </div>
              {details?.imageCaption && (
                <figcaption className="mt-2 text-center font-mono text-xs text-[#0C2D48]/60">
                  {details.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* 2-Column Split: Article Body Left (8 cols), Sticky Table of Contents Right (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-8">
            {/* Main Article Body (8 cols) */}
            <div className="lg:col-span-8">
              <div className="relative border border-[#0C2D48]/12 bg-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
                <CornerCrosshairs color="text-[#22C55E]/40" size={14} />
                {!body ? (
                  <div className="space-y-4" aria-busy="true">
                    <p className="text-lg leading-relaxed text-[#0C2D48]">{post.excerpt}</p>
                    <div className="h-4 w-3/4 animate-pulse bg-[#0C2D48]/10 rounded" />
                    <div className="h-4 w-2/3 animate-pulse bg-[#0C2D48]/10 rounded" />
                  </div>
                ) : body.kind === 'markdown' ? (
                  <MarkdownArticleContent markdown={body.markdown} />
                ) : (
                  <LongFormArticleContent article={body} />
                )}
              </div>

              {/* Contextual Advisory Lead Conversion Module */}
              <ArticleContextualCta category={post.category} />
            </div>

            {/* Sticky Index Sidebar (4 cols) */}
            <aside className="lg:col-span-4 hidden lg:block sticky top-28 space-y-6">
              <ArticleTableOfContents />

              {/* Direct Partner Hotline Pill */}
              <div className="p-5 rounded-2xl bg-white border border-[#0C2D48]/10 shadow-sm text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-semibold text-[#16A34A]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Direct Desk Access
                </div>
                <p className="text-[#0C2D48]/70 leading-relaxed">
                  Have specific jurisdictional questions regarding this briefing? Speak directly
                  with our senior corporate counsel.
                </p>
                <a
                  href={CONTACT_CHANNELS.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2.5 rounded-xl bg-[#0C2D48] text-white text-center font-medium hover:bg-[#0C2D48]/90 transition-all shadow-sm"
                >
                  Consult Senior Director
                </a>
              </div>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}
