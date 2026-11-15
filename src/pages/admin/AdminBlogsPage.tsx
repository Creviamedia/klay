import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FileEdit,
  Plus,
  Trash2,
  Save,
  Globe,
  Clock,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  Table as TableIcon,
  Quote,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Lock,
  Unlock,
  Split,
  Maximize2,
} from 'lucide-react';
import { MarkdownArticleContent } from '@/components/blog/MarkdownArticleContent';

export interface AdminBlogRecord {
  id?: string;
  slug: string;
  title: string;
  pillar: string;
  reading_time?: number;
  readingTime?: number;
  excerpt?: string;
  cover_image?: string;
  coverImage?: string;
  content: string;
  status: 'draft' | 'published';
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export const OFFICIAL_PILLARS = [
  'Company Setup & Strategy',
  'Corporate Tax',
  'Golden Visa & Residency',
  'Banking & AML',
  'Free Zones',
  'Mainland (DED)',
  'Wills & Estate Planning',
] as const;

const DEFAULT_COVER_IMAGE = '/images/blog/dubai-executive-at-sunset.webp';

const STARTER_TEMPLATE = `## Executive Overview
The United Arab Emirates continues to refine its statutory and regulatory architecture, introducing sophisticated frameworks for international entrepreneurs, corporate conglomerates, and family offices.

### Statutory Requirements & Licensing
Under current Cabinet decisions, companies established in both Free Zones and Mainland jurisdictions must maintain strict adherence to:
- Economic Substance Regulations (ESR)
- Anti-Money Laundering (AML) & Ultimate Beneficial Ownership (UBO) filings
- Federal Corporate Tax registration under Federal Decree-Law No. 47

| Jurisdiction Type | Corporate Tax Rate | Foreign Ownership | Capital Repatriation |
| --- | --- | --- | --- |
| Qualifying Free Zone | 0% on Qualifying Income | 100% | 100% |
| Dubai Mainland (DED) | 9% above AED 375,000 | 100% (Most Activities) | 100% |
| Offshore (RAK ICC) | 0% (Subject to Nexus) | 100% | 100% |

### Strategic Recommendation
> Founders structuring new ventures should conduct an upfront regulatory nexus analysis before finalising commercial licence activity codes.`;

export function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<AdminBlogRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [pillar, setPillar] = useState<string>(OFFICIAL_PILLARS[0]);
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER_IMAGE);
  const [content, setContent] = useState(STARTER_TEMPLATE);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Layout view mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-slug generator
  const generateSlug = (raw: string) => {
    return raw
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManual) {
      setSlug(generateSlug(val));
    }
  };

  // Real-time Reading Time Calculation (200 words per minute)
  const readingTime = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [content]);

  // Fetch blogs from API
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const token =
        localStorage.getItem('klay_admin_token') || sessionStorage.getItem('klay_admin_token');

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/blogs', {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch blogs (${res.status})`);
      }

      const data = await res.json();
      const loaded: AdminBlogRecord[] = Array.isArray(data.blogs) ? data.blogs : [];
      setBlogs(loaded);

      // Cache locally in localStorage for frontend live sync
      try {
        localStorage.setItem('klay_published_blogs', JSON.stringify(loaded));
      } catch {
        // Storage full or unavailable
      }

      // If an article is already selected or we have articles, load the first
      if (loaded.length > 0 && !selectedSlug) {
        loadArticleIntoForm(loaded[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading blogs';
      setFeedback({ type: 'error', message: msg });

      // Fallback to local storage if API offline
      try {
        const cached = localStorage.getItem('klay_published_blogs');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setBlogs(parsed);
            loadArticleIntoForm(parsed[0]);
          }
        }
      } catch {
        // Ignore JSON error
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  // Populate editor form with selected article
  const loadArticleIntoForm = (article: AdminBlogRecord) => {
    setSelectedSlug(article.slug);
    setTitle(article.title);
    setSlug(article.slug);
    setIsSlugManual(true);
    setPillar(article.pillar || OFFICIAL_PILLARS[0]);
    setExcerpt(article.excerpt || '');
    setCoverImage(article.coverImage || article.cover_image || DEFAULT_COVER_IMAGE);
    setContent(article.content || '');
    setStatus(article.status || 'draft');
  };

  // Reset editor for brand new article
  const handleCreateNew = () => {
    setSelectedSlug('');
    setTitle('');
    setSlug('');
    setIsSlugManual(false);
    setPillar(OFFICIAL_PILLARS[0]);
    setExcerpt('');
    setCoverImage(DEFAULT_COVER_IMAGE);
    setContent(STARTER_TEMPLATE);
    setStatus('draft');
    setViewMode('split');
  };

  // Markdown Toolbar Insertion Helper
  const insertMarkdown = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    const replacement = `${before}${selectedText}${after}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Re-focus and position cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Save / Publish Action
  const handleSave = async (targetStatus: 'draft' | 'published') => {
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Article title is required.' });
      return;
    }
    const finalSlug = slug.trim() || generateSlug(title);
    if (!finalSlug) {
      setFeedback({ type: 'error', message: 'Valid slug identifier is required.' });
      return;
    }
    if (!content.trim()) {
      setFeedback({ type: 'error', message: 'Article markdown content cannot be empty.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      pillar,
      readingTime,
      reading_time: readingTime,
      excerpt: excerpt.trim(),
      coverImage: coverImage.trim(),
      cover_image: coverImage.trim(),
      content,
      status: targetStatus,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const token =
        localStorage.getItem('klay_admin_token') || sessionStorage.getItem('klay_admin_token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to save article (${res.status})`);
      }

      const savedData = await res.json();
      const savedArticle: AdminBlogRecord = savedData.blog || payload;

      setStatus(targetStatus);
      setSelectedSlug(finalSlug);

      // Update in-memory list
      setBlogs((prev) => {
        const index = prev.findIndex((b) => b.slug === finalSlug);
        let updated: AdminBlogRecord[];
        if (index >= 0) {
          updated = [...prev];
          updated[index] = savedArticle;
        } else {
          updated = [savedArticle, ...prev];
        }
        try {
          localStorage.setItem('klay_published_blogs', JSON.stringify(updated));
        } catch {
          // LocalStorage fallback
        }
        return updated;
      });

      setFeedback({
        type: 'success',
        message:
          targetStatus === 'published'
            ? `Article "${savedArticle.title}" published successfully!`
            : `Draft saved successfully.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save operation failed';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!selectedSlug) return;
    const confirmDelete = window.confirm(
      `Are you certain you want to delete article "${title || selectedSlug}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsSaving(true);
    try {
      const token =
        localStorage.getItem('klay_admin_token') || sessionStorage.getItem('klay_admin_token');

      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/admin/blogs/${encodeURIComponent(selectedSlug)}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to delete article (${res.status})`);
      }

      // Remove from list
      const remaining = blogs.filter((b) => b.slug !== selectedSlug);
      setBlogs(remaining);
      try {
        localStorage.setItem('klay_published_blogs', JSON.stringify(remaining));
      } catch {
        // Ignore
      }

      setFeedback({
        type: 'success',
        message: `Article deleted successfully.`,
      });

      if (remaining.length > 0) {
        loadArticleIntoForm(remaining[0]);
      } else {
        handleCreateNew();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete operation failed';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Studio Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Content Studio &amp; Blog CMS
            <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
              {blogs.length} Articles in Database
            </span>
          </h1>
          <p className="font-mono text-xs text-white/50 mt-1">
            Authoritative regulatory publications, dual-pane markdown editing &amp; instant live
            preview
          </p>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0C2D48] hover:bg-[#103859] text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-mono font-semibold transition-all shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>

          <button
            onClick={fetchBlogs}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0A1E30] hover:bg-[#0C2D48] text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-all disabled:opacity-50"
            title="Reload articles"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#D4AF37]' : ''}`}
            />
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#05131F] border border-white/10 rounded-xl p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'editor'
                  ? 'bg-[#0C2D48] text-[#D4AF37] font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1.5 rounded-lg transition-all hidden sm:inline-block ${
                viewMode === 'split'
                  ? 'bg-[#0C2D48] text-[#D4AF37] font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'preview'
                  ? 'bg-[#0C2D48] text-[#D4AF37] font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          role="alert"
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 shadow-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Article Selector Strip */}
      <div className="bg-[#0A1E30] border border-[#0C2D48] rounded-2xl p-4 shadow-lg shadow-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="font-mono text-xs uppercase tracking-wider text-white/50 shrink-0">
            Selected Article:
          </span>
          <select
            value={selectedSlug}
            onChange={(e) => {
              const found = blogs.find((b) => b.slug === e.target.value);
              if (found) loadArticleIntoForm(found);
            }}
            className="w-full max-w-xl px-3 py-1.5 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer truncate"
          >
            <option value="">-- [Create New Article Draft] --</option>
            {blogs.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.status === 'published' ? '🟢' : '⚪'} {b.title || b.slug} ({b.pillar})
              </option>
            ))}
          </select>
        </div>

        {selectedSlug && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/blog/${selectedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span>View Live Article</span>
              <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
            </a>

            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors disabled:opacity-50"
              title="Delete Article"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Dual-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* =========================================================================
            LEFT COLUMN: FORM & MARKDOWN EDITOR (6 cols in split, 12 cols in editor)
            ========================================================================= */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`space-y-5 ${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <div className="bg-[#0A1E30] border border-[#0C2D48] rounded-2xl p-5 shadow-xl shadow-black/30 space-y-4">
              {/* Title & Auto-slug */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                  Article Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. UAE Corporate Tax Guide 2026: Executive Deductions"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#05131F] border border-white/10 rounded-xl text-sm font-sans font-medium text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
              </div>

              {/* Slug Input with Override Lock */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSlugManual(!isSlugManual);
                      if (isSlugManual && title) {
                        setSlug(generateSlug(title));
                      }
                    }}
                    className="inline-flex items-center gap-1 font-mono text-[10px] text-[#D4AF37] hover:underline"
                  >
                    {isSlugManual ? (
                      <>
                        <Unlock className="w-3 h-3" />
                        <span>Manual Override (Click to sync)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        <span>Live Auto-Generated</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#0C2D48] border border-r-0 border-white/10 rounded-l-xl text-xs font-mono text-white/50 select-none">
                    /blog/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setIsSlugManual(true);
                    }}
                    placeholder="uae-corporate-tax-guide-2026"
                    className="w-full px-3.5 py-2.5 bg-[#05131F] border border-white/10 rounded-r-xl text-xs font-mono text-[#D4AF37] placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              {/* Pillar Selector & Reading Time Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                    Pillar Category
                  </label>
                  <select
                    value={pillar}
                    onChange={(e) => setPillar(e.target.value)}
                    className="w-full px-3 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                  >
                    {OFFICIAL_PILLARS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                    Calculated Reading Time
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-[#22C55E]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold">{readingTime} min read</span>
                    <span className="text-white/40 text-[10px]">
                      ({content.trim().split(/\s+/).filter(Boolean).length} words)
                    </span>
                  </div>
                </div>
              </div>

              {/* Excerpt (Max 250 characters) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                    Executive Briefing Excerpt
                  </label>
                  <span
                    className={`font-mono text-[10px] ${
                      excerpt.length > 250 ? 'text-rose-400 font-bold' : 'text-white/40'
                    }`}
                  >
                    {excerpt.length} / 250 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={250}
                  placeholder="Concise executive briefing summarizing statutory implications..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-sans text-white/90 placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-all"
                />
              </div>

              {/* Cover Photo URL & Thumbnail Preview */}
              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                  Cover Photo Image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or /images/blog/..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-all"
                    />
                  </div>
                  {coverImage && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-black/40">
                      <img
                        src={coverImage}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_COVER_IMAGE;
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Editor Toolbar */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-xs uppercase tracking-wider text-white/70">
                    Markdown Article Content
                  </label>
                  <span className="font-mono text-[10px] text-white/40">
                    Supports H2, H3, Lists, Tables, Quotes
                  </span>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex flex-wrap items-center gap-1 p-1 bg-[#05131F] border border-white/10 rounded-xl text-white/70">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n## ', '\n', 'Section Heading')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n### ', '\n', 'Subheading')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-white/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**', 'bold text')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*', 'italic text')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <div className="h-4 w-px bg-white/10 mx-0.5" />

                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n- ', '\n', 'Bullet list item')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Bulleted List"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      insertMarkdown(
                        '\n| Jurisdiction | Cost (AED) | Timeline |\n| --- | --- | --- |\n| Option A | 12,500 | 3 Days |\n| Option B | 14,000 | 5 Days |\n'
                      )
                    }
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Markdown Table"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => insertMarkdown('\n> ', '\n', 'Executive Advisory Note...')}
                    className="p-1.5 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Blockquote"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={16}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your article in Markdown..."
                  className="w-full p-4 bg-[#05131F] border border-white/10 rounded-xl text-xs font-mono text-white/90 placeholder-white/30 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all leading-relaxed"
                />
              </div>

              {/* Action Buttons: Save Draft & Publish Article */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold border ${
                      status === 'published'
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30'
                        : 'bg-white/10 text-white/60 border-white/20'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === 'published' ? 'bg-[#22C55E]' : 'bg-white/40'
                      }`}
                    />
                    <span>{status === 'published' ? 'Published' : 'Draft'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#05131F] hover:bg-white/5 text-white/80 hover:text-white border border-white/10 text-xs font-mono transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('published')}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0C2D48] via-[#103859] to-[#0C2D48] hover:from-[#103859] hover:to-[#174871] text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-xs font-mono font-semibold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>Publish Article</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            RIGHT COLUMN: 1:1 LIVE PREVIEW PANE (6 cols in split, 12 cols in preview)
            ========================================================================= */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`space-y-4 ${viewMode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            {/* Live Preview Container matching BlogArticlePage design */}
            <div className="bg-white text-[#0C2D48] rounded-2xl border border-[#0C2D48]/15 p-6 sm:p-8 shadow-2xl overflow-hidden font-sans">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#0C2D48]/10 text-xs font-mono text-[#0C2D48]/60">
                <span className="flex items-center gap-1.5 text-[#16A34A] font-semibold uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5" /> 1:1 Live Consumer Preview
                </span>
                <span>/blog/{slug || 'post-preview'}</span>
              </div>

              {/* Category, Reading time & Date chips */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="border border-[#16A34A]/30 bg-[#16A34A]/10 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider text-[#16A34A]">
                  {pillar}
                </span>
                <span className="text-xs font-mono text-[#0C2D48]/50 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {readingTime} min read
                </span>
                <span className="text-[#0C2D48]/30">&bull;</span>
                <span className="text-xs font-mono text-[#0C2D48]/50">
                  {new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#0C2D48] leading-tight mb-4">
                {title || 'Untitled Sovereign Briefing'}
              </h1>

              {/* Author Credential Chip */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#0C2D48] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0">
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

              {/* Excerpt */}
              {excerpt && (
                <div className="p-4 rounded-xl bg-[#FAFBFD] border-l-4 border-[#16A34A] text-sm italic text-[#0C2D48]/80 mb-6 leading-relaxed">
                  {excerpt}
                </div>
              )}

              {/* Cover Image */}
              {coverImage && (
                <div className="my-6 rounded-2xl overflow-hidden border border-[#0C2D48]/10 max-h-[320px] bg-slate-100">
                  <img
                    src={coverImage}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_COVER_IMAGE;
                    }}
                  />
                </div>
              )}

              {/* Article Content Rendered via MarkdownArticleContent */}
              <div className="pt-4 border-t border-[#0C2D48]/10">
                <MarkdownArticleContent markdown={content} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBlogsPage;
