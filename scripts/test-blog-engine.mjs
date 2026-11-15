import assert from 'node:assert/strict';
import {
  getAllArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryPillars,
  searchArticles,
  normalizeCategory,
  estimateReadingTime,
} from '../src/lib/blog-engine.ts';

console.log('🧪 Running Blog Engine & Universal Adapter Test Suite...');

// 1. Total count check
const all = getAllArticles();
assert.equal(all.length, 101, 'Should contain all 101 baseline articles');
console.log(`  ✓ 101 baseline articles loaded cleanly (${all.length} total)`);

// 2. Featured articles check
const featured = getFeaturedArticles(3);
assert.equal(featured.length, 3, 'Should return exactly 3 featured articles');
console.log('  ✓ Featured articles selector verified');

// 3. Category Pillars check
const pillars = getCategoryPillars();
assert.ok(pillars.length >= 7, 'Should have at least 7 curated category pillars');
assert.equal(pillars[0].name, 'All Insights');
assert.equal(pillars[0].count, 101);
console.log('  ✓ Category pillars normalization verified');

// 4. Slug lookup check
const first = all[0];
const lookup = getArticleBySlug(first.slug);
assert.ok(lookup, 'Must find article by slug');
assert.equal(lookup.slug, first.slug);
console.log('  ✓ Slug lookup verified');

// 5. Search function check
const searchResults = searchArticles('Golden Visa');
assert.ok(searchResults.length > 0, 'Should find articles matching "Golden Visa"');
console.log(`  ✓ Search query returned ${searchResults.length} matching articles`);

// 6. Reading time check
const readTime = estimateReadingTime('one two three four five six seven eight nine ten');
assert.ok(readTime.includes('min read'), 'Should format reading time cleanly');
console.log('  ✓ Reading time calculator verified');

console.log('🎉 ALL BLOG ENGINE TESTS PASSED CLEANLY (100% assertions green)!');
