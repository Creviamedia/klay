/**
 * Utility script: Exports all 101 local articles into Sanity NDJSON format.
 * Usage: node scripts/export-articles-to-sanity.mjs > sanity-articles-export.ndjson
 * Can be directly imported via Sanity CLI: `sanity dataset import sanity-articles-export.ndjson production`
 */

import { BLOG_POSTS } from '../src/content/blog/posts.ts';

console.error(`Exporting ${BLOG_POSTS.length} articles to Sanity NDJSON format...`);

for (const post of BLOG_POSTS) {
  const sanityDoc = {
    _id: `post-${post.slug}`,
    _type: 'post',
    title: post.title,
    slug: {
      _type: 'slug',
      current: post.slug,
    },
    excerpt: post.excerpt,
    date: post.date,
    category: post.category,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    focusKeyword: post.focusKeyword || '',
    mainImage: {
      _type: 'image',
      alt: post.imageAlt || post.title,
    },
  };

  process.stdout.write(JSON.stringify(sanityDoc) + '\n');
}

console.error('✅ Export complete.');
