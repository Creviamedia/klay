import { createClient, type SanityClient } from '@sanity/client';
import type { BlogPostSummary } from '../content/blog/types';

const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : typeof process !== 'undefined'
      ? process.env
      : ({} as Record<string, string | undefined>);

const projectId = env.VITE_SANITY_PROJECT_ID;
const dataset = env.VITE_SANITY_DATASET || 'production';
const apiVersion = env.VITE_SANITY_API_VERSION || '2026-03-01';

let client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (client) return client;
  if (!projectId) return null;

  try {
    client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    });
    return client;
  } catch (err) {
    console.warn('[Sanity] Client initialization bypassed:', err);
    return null;
  }
}

export interface SanityArticleDoc {
  _id: string;
  slug: { current: string };
  title: string;
  excerpt: string;
  date: string;
  category: string;
  mainImage?: {
    asset?: {
      url?: string;
    };
    alt?: string;
  };
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  body?: string;
}

/**
 * Normalizes a Sanity article document into the standard BlogPostSummary schema.
 */
export function normalizeSanityDoc(doc: SanityArticleDoc): BlogPostSummary {
  return {
    slug: doc.slug?.current || doc._id,
    title: doc.title,
    excerpt: doc.excerpt || '',
    date: doc.date || new Date().toISOString().split('T')[0],
    category: doc.category || 'Regulatory & Commercial',
    image: doc.mainImage?.asset?.url || '/images/blog/dubai-executive-at-sunset.webp',
    imageAlt: doc.mainImage?.alt || doc.title,
    metaTitle: doc.metaTitle || doc.title,
    metaDescription: doc.metaDescription || doc.excerpt || '',
    focusKeyword: doc.focusKeyword || '',
  };
}

/**
 * Fetches published articles from Sanity.
 * Returns empty array if Sanity is unconfigured or unreachable (local fallback takes over).
 */
export async function fetchSanityArticles(): Promise<BlogPostSummary[]> {
  const sanity = getSanityClient();
  if (!sanity) return [];

  try {
    const query = `*[_type == "post" && defined(slug.current)] | order(date desc) {
      _id,
      slug,
      title,
      excerpt,
      date,
      category,
      "mainImage": {
        "asset": {
          "url": mainImage.asset->url
        },
        "alt": mainImage.alt
      },
      metaTitle,
      metaDescription,
      focusKeyword
    }`;
    const docs = await sanity.fetch<SanityArticleDoc[]>(query);
    return docs.map(normalizeSanityDoc);
  } catch (error) {
    console.warn('[Sanity] Failed to fetch remote articles, falling back to local files:', error);
    return [];
  }
}
