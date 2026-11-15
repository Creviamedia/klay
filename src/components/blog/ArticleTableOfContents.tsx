import React, { useEffect, useState } from 'react';
import { ListOrdered } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function ArticleTableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Scan rendered article content for h2 and h3 elements
    const elements = Array.from(document.querySelectorAll('article h2, article h3'));
    const items: TocItem[] = elements
      .map((el, index) => {
        if (!el.id) {
          el.id = `heading-section-${index}`;
        }
        return {
          id: el.id,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3,
        };
      })
      .filter((item) => item.text.trim().length > 0);

    setHeadings(items);

    // Scroll spy intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="p-5 rounded-2xl bg-white border border-[#0C2D48]/10 shadow-sm font-sans space-y-3">
      <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#0C2D48]/70 pb-2 border-b border-[#0C2D48]/10">
        <ListOrdered className="w-3.5 h-3.5 text-[#16A34A]" />
        <span>Executive Briefing Index</span>
      </div>

      <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
        {headings.map((item, idx) => {
          const isActive = activeId === item.id;
          const indexNum = String(idx + 1).padStart(2, '0');

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                setActiveId(item.id);
              }}
              className={`block text-xs py-1 transition-all flex items-start gap-2 ${
                item.level === 3 ? 'pl-4' : 'pl-0'
              } ${
                isActive ? 'text-[#16A34A] font-semibold' : 'text-[#0C2D48]/70 hover:text-[#0C2D48]'
              }`}
            >
              <span className="font-mono text-[10px] text-[#0C2D48]/40 shrink-0 mt-0.5">
                {indexNum}
              </span>
              <span className="leading-snug line-clamp-2">{item.text}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
