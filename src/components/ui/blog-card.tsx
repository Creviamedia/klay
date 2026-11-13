import { Calendar, ArrowRight } from 'lucide-react';
import { CornerCrosshairs } from '@/components/ui/CornerCrosshairs';
import { Link } from '@/components/ui/link';
import { Image } from '@/components/ui/image';
import { getBlogArticleRoute } from '@/lib/routes';

interface BlogCardProps {
  title: string;
  excerpt: string;
  date?: string;
  image?: string;
  imageAlt?: string;
  imageTitle?: string;
  slug: string;
  category?: string;
  /** Load the cover image first: pass it for the first card, which is the page's LCP image. */
  priority?: boolean;
}

export function BlogCard({
  title,
  excerpt,
  date,
  image,
  imageAlt,
  imageTitle,
  slug,
  category,
  priority = false,
}: BlogCardProps) {
  return (
    <Link href={getBlogArticleRoute(slug)} className="group block h-full">
      <article className="relative flex h-full flex-col border border-[#0C2D48]/10 bg-white p-5 transition-all duration-300 hover:border-[#0C2D48]/30 hover:shadow-sm sm:p-6">
        <CornerCrosshairs color="text-[#22C55E]/40" size={10} />

        <div className="relative mb-5 aspect-[16/10] overflow-hidden border border-[#0C2D48]/10 bg-[#05131F]/5">
          {image ? (
            <Image
              src={image}
              alt={imageAlt ?? title}
              title={imageTitle}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#05131F]">
              <span className="font-heading text-4xl font-bold text-[#22C55E]">
                {title.charAt(0)}
              </span>
            </div>
          )}
          {category && (
            <div className="absolute left-3 top-3">
              <span className="border border-white/20 bg-[#05131F]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                {category}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          {date && (
            <div className="mb-3 flex items-center gap-1.5 font-mono text-xs text-[#0C2D48]/50">
              <Calendar className="h-3 w-3" />
              <span>{date}</span>
            </div>
          )}

          <h2 className="mb-3 font-heading text-lg font-semibold leading-snug text-[#0C2D48] transition-colors group-hover:text-[#16A34A] line-clamp-2">
            {title}
          </h2>

          <p className="mb-5 flex-1 text-sm leading-relaxed text-[#0C2D48]/70 line-clamp-3">
            {excerpt}
          </p>

          <div className="flex items-center justify-between border-t border-[#0C2D48]/10 pt-4 text-xs font-semibold uppercase tracking-wider text-[#0C2D48] group-hover:text-[#16A34A]">
            <span>Read Publication</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0C2D48]/5 text-[#0C2D48] transition-all group-hover:bg-[#22C55E] group-hover:text-black">
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
