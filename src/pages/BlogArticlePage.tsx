import { ArrowLeft, Calendar, Instagram } from 'lucide-react';
import { lazy, Suspense, type ComponentType } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { LongFormArticleContent } from '@/components/blog/LongFormArticleContent';
import { MarkdownArticleContent } from '@/components/blog/MarkdownArticleContent';
import { PageCTA } from '@/components/sections/MarketingPages';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { Image } from '@/components/ui/image';
import { Link } from '@/components/ui/link';
import { BLOG_REDIRECTS, getBlogPost, loadBlogArticle, type BlogArticle, type BlogPostSummary } from '@/content/blog';
import { CONTACT_CHANNELS } from '@/lib/contact';
import { getBlogArticleRoute } from '@/lib/routes';
import { NotFoundPage } from '@/pages/NotFoundPage';

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
    })),
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
  if (trimSlash(pathname) !== trimSlash(canonicalPath)) return <Navigate to={canonicalPath} replace />;

  return (
    <Suspense fallback={<ArticleLayout post={post} />}>
      <ArticleView post={post} />
    </Suspense>
  );
}

function ArticleLayout({ post, article }: { post: BlogPostSummary; article?: BlogArticle }) {
  const details = article?.details;
  const body = article?.body;

  return (
    <div className="relative z-[1] bg-[#FBFBFB] text-[#0C2D48]">
      <article className="pb-16 pt-28 sm:pt-36">
        <div className="mx-auto max-w-4xl px-6">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-[#0C2D48]/60 transition-colors hover:text-[#16A34A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Publications
          </Link>

          <div className="mb-4">
            <span className="border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#16A34A]">
              {post.category}
            </span>
          </div>

          <h1 className="font-heading text-3xl font-light tracking-tight text-[#0C2D48] sm:text-4xl lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[#0C2D48]/50">
            <Calendar className="h-3.5 w-3.5" />
            <span>{post.date}</span>
          </div>

          {details?.tags && (
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Article tags">
              {details.tags.map((tag) => (
                <span key={tag} className="border border-[#0C2D48]/10 bg-white px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#0C2D48]/70">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.image && (
            <figure className="relative mt-8 border border-[#0C2D48]/10 bg-white p-3 shadow-sm">
              <CornerCrosshairs color="text-[#22C55E]/40" size={12} />
              <div className="overflow-hidden bg-[#05131F]/5">
                <Image
                  src={post.image}
                  alt={post.imageAlt ?? post.title}
                  title={details?.imageTitle}
                  aria-describedby={details?.imageDescription ? 'article-image-description' : undefined}
                  width={1600}
                  height={900}
                  priority
                  className="h-auto w-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 896px"
                />
              </div>
              {details?.imageCaption && (
                <figcaption className="mt-2 text-center font-mono text-xs text-[#0C2D48]/60">{details.imageCaption}</figcaption>
              )}
              {details?.imageDescription && (
                <span id="article-image-description" className="sr-only">{details.imageDescription}</span>
              )}
            </figure>
          )}

          <div className="relative mt-8 border border-[#0C2D48]/10 bg-white p-8 sm:p-12 lg:p-14 shadow-sm">
            <CornerCrosshairs color="text-[#22C55E]/40" size={14} />
            {!body ? (
              <div className="space-y-4" aria-busy="true">
                <p className="text-lg leading-relaxed text-[#0C2D48]">{post.excerpt}</p>
                <div className="h-4 w-3/4 animate-pulse bg-[#0C2D48]/10" />
                <div className="h-4 w-2/3 animate-pulse bg-[#0C2D48]/10" />
              </div>
            ) : body.kind === 'markdown' ? (
              <MarkdownArticleContent markdown={body.markdown} />
            ) : (
              <LongFormArticleContent article={body} />
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href={CONTACT_CHANNELS.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-[#0C2D48]/15 bg-white px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#0C2D48] transition-colors hover:border-[#22C55E] hover:text-[#16A34A]"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Follow on Instagram
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </article>

      {body?.kind === 'markdown' && <PageCTA title="Need guidance with your UAE setup?" />}
    </div>
  );
}
