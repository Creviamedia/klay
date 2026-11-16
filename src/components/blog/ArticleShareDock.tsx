import React, { useState } from 'react';
import { Share2, Check, MessageSquare, Linkedin, Twitter, Copy } from 'lucide-react';

interface Props {
  title: string;
  url?: string;
}

export function ArticleShareDock({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(currentUrl).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = encodeURIComponent(`${title} | Klay Corporate Advisory`);
  const encodedUrl = encodeURIComponent(currentUrl);

  const whatsappUrl = `https://wa.me/?text=${shareText}%20${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;

  return (
    <div className="flex items-center gap-2 border-y border-[#0C2D48]/10 py-3 my-6 text-xs font-mono">
      <span className="text-[#0C2D48]/50 flex items-center gap-1.5 mr-2">
        <Share2 className="w-3.5 h-3.5" /> Share Insight:
      </span>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share to WhatsApp"
        className="px-2.5 py-1 rounded-lg border border-[#0C2D48]/10 bg-white hover:border-[#22C55E] hover:text-[#16A34A] text-[#0C2D48] transition-all flex items-center gap-1"
      >
        <MessageSquare className="w-3 h-3 text-[#22C55E]" />
        <span>WhatsApp</span>
      </a>

      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share to LinkedIn"
        className="px-2.5 py-1 rounded-lg border border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 text-[#0C2D48] transition-all flex items-center gap-1"
      >
        <Linkedin className="w-3 h-3 text-[#0284C7]" />
        <span>LinkedIn</span>
      </a>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share to X"
        className="px-2.5 py-1 rounded-lg border border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 text-[#0C2D48] transition-all flex items-center gap-1"
      >
        <Twitter className="w-3 h-3 text-[#0C2D48]" />
        <span>X</span>
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className="px-2.5 py-1 rounded-lg border border-[#0C2D48]/10 bg-white hover:border-[#0C2D48]/30 text-[#0C2D48] transition-all flex items-center gap-1 ml-auto"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-[#16A34A]" />
            <span className="text-[#16A34A] font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3 text-[#0C2D48]/50" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
