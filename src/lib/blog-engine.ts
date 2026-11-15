import { BLOG_POSTS } from '../content/blog/posts.ts';
import type { BlogPostSummary } from '../content/blog/types.ts';
import { fetchSanityArticles } from './sanity.ts';

export interface CategoryPillar {
  id: string;
  name: string;
  count: number;
}

/** Standard advisory pillars for luxury category filtering */
export const CATEGORY_PILLARS = [
  'All Insights',
  'Company Setup & Strategy',
  'Corporate Tax',
  'Golden Visa & Residency',
  'Banking & AML',
  'Free Zones',
  'Mainland (DED)',
  'Wills & Estate Planning',
] as const;

export type CategoryPillarName = (typeof CATEGORY_PILLARS)[number];

// Cache of local static articles sorted newest first
const LOCAL_ARTICLES: BlogPostSummary[] = [...BLOG_POSTS]
  .map((post, index) => ({ post, index, time: Date.parse(post.date) || 0 }))
  .sort((a, b) => b.time - a.time || a.index - b.index)
  .map(({ post }) => post);

/**
 * Normalizes varied category, title, and slug strings into curated luxury editorial pillars.
 */
export function normalizeCategory(category: string, title = '', slug = ''): CategoryPillarName {
  const combined = `${category} ${title} ${slug}`.toLowerCase();
  if (combined.includes('tax') || combined.includes('trn') || combined.includes('vat')) {
    return 'Corporate Tax';
  }
  if (
    combined.includes('visa') ||
    combined.includes('residency') ||
    combined.includes('golden') ||
    combined.includes('immigration')
  ) {
    return 'Golden Visa & Residency';
  }
  if (
    combined.includes('will') ||
    combined.includes('estate') ||
    combined.includes('inheritance') ||
    combined.includes('succession') ||
    combined.includes('guardianship')
  ) {
    return 'Wills & Estate Planning';
  }
  if (
    combined.includes('bank') ||
    combined.includes('aml') ||
    combined.includes('compliance') ||
    combined.includes('kyc') ||
    combined.includes('esr') ||
    combined.includes('economic substance')
  ) {
    return 'Banking & AML';
  }
  if (
    combined.includes('free zone') ||
    combined.includes('dmcc') ||
    combined.includes('ifza') ||
    combined.includes('meydan') ||
    combined.includes('jafza') ||
    combined.includes('rak icc')
  ) {
    return 'Free Zones';
  }
  if (
    combined.includes('mainland') ||
    combined.includes('ded') ||
    combined.includes('det') ||
    combined.includes('commercial llc')
  ) {
    return 'Mainland (DED)';
  }
  return 'Company Setup & Strategy';
}

/**
 * Estimates reading time based on 200 words per minute.
 */
export function estimateReadingTime(wordCountOrText: number | string): string {
  const words =
    typeof wordCountOrText === 'number'
      ? wordCountOrText
      : (wordCountOrText || '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/**
 * Formats date into luxury editorial standard: e.g. '12 Nov 2026'.
 */
export function formatArticleDate(dateStr: string): string {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return dateStr;
  const date = new Date(parsed);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Universal blog engine: returns all articles (local 101 articles + optional Sanity cloud posts).
 */
export function getAllArticles(): BlogPostSummary[] {
  return LOCAL_ARTICLES;
}

/**
 * Asynchronously loads combined articles including live Sanity posts.
 */
export async function getUnifiedArticles(): Promise<BlogPostSummary[]> {
  const sanityArticles = await fetchSanityArticles();
  if (sanityArticles.length === 0) return LOCAL_ARTICLES;

  // Merge Sanity on top of local (deduplicate by slug)
  const map = new Map<string, BlogPostSummary>();
  LOCAL_ARTICLES.forEach((a) => map.set(a.slug, a));
  sanityArticles.forEach((a) => map.set(a.slug, a));

  return Array.from(map.values()).sort(
    (a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)
  );
}

/**
 * Returns top curated featured articles for homepage or hero cards.
 */
export function getFeaturedArticles(count = 3): BlogPostSummary[] {
  return LOCAL_ARTICLES.slice(0, count);
}

/**
 * Returns article by slug.
 */
export function getArticleBySlug(slug: string): BlogPostSummary | undefined {
  return LOCAL_ARTICLES.find((a) => a.slug === slug);
}

/**
 * Filters articles by category pillar.
 */
export function getArticlesByCategory(category: string): BlogPostSummary[] {
  if (!category || category === 'All Insights') return LOCAL_ARTICLES;
  return LOCAL_ARTICLES.filter((a) => normalizeCategory(a.category, a.title, a.slug) === category);
}

/**
 * Returns all available category pillars with article counts.
 */
export function getCategoryPillars(): CategoryPillar[] {
  const counts: Record<string, number> = {};
  CATEGORY_PILLARS.forEach((p) => {
    counts[p] = 0;
  });

  counts['All Insights'] = LOCAL_ARTICLES.length;

  LOCAL_ARTICLES.forEach((a) => {
    const pillar = normalizeCategory(a.category, a.title, a.slug);
    if (counts[pillar] !== undefined) {
      counts[pillar]++;
    }
  });

  return CATEGORY_PILLARS.map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name,
    count: counts[name] || 0,
  }));
}

/**
 * Fast client-side search across articles.
 */
export function searchArticles(query: string, categoryFilter = 'All Insights'): BlogPostSummary[] {
  const trimmed = query.trim().toLowerCase();
  const base = getArticlesByCategory(categoryFilter);

  if (!trimmed) return base;

  return base.filter((article) => {
    const titleMatch = article.title.toLowerCase().includes(trimmed);
    const excerptMatch = article.excerpt.toLowerCase().includes(trimmed);
    const keywordMatch = article.focusKeyword?.toLowerCase().includes(trimmed);
    const categoryMatch = article.category.toLowerCase().includes(trimmed);
    return titleMatch || excerptMatch || keywordMatch || categoryMatch;
  });
}
