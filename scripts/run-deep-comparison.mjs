import { chromium } from 'playwright';
import fs from 'fs';

async function runComparison() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  console.log('Loading https://equitifyasset.com/ ...');
  const pageEquitify = await context.newPage();
  await pageEquitify.goto('https://equitifyasset.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await pageEquitify.waitForTimeout(2000);

  console.log('Loading http://localhost:5173/ ...');
  const pageKlay = await context.newPage();
  await pageKlay.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
  await pageKlay.waitForTimeout(2000);

  // Extract structure from Equitify
  const equitifyData = await pageEquitify.evaluate(() => {
    function getDirectText(el) {
      return Array.from(el.childNodes)
        .filter(n => n.nodeType === Node.TEXT_NODE)
        .map(n => n.textContent.trim())
        .filter(Boolean)
        .join(' ');
    }

    // Get all top-level or main sections
    const elements = Array.from(document.querySelectorAll('nav, header, section, footer, main > div, div[data-framer-name]'));
    
    // Get visible headings and their text
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"], p')).map(h => ({
      tag: h.tagName,
      text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
      fontSize: window.getComputedStyle(h).fontSize,
      fontWeight: window.getComputedStyle(h).fontWeight,
      color: window.getComputedStyle(h).color,
      rect: { y: Math.round(h.getBoundingClientRect().top + window.scrollY), height: Math.round(h.getBoundingClientRect().height) }
    })).filter(h => h.text.length > 3 && h.rect.height > 0).slice(0, 40);

    // Get navigation
    const navLinks = Array.from(document.querySelectorAll('header a, nav a, [data-framer-name*="Nav"] a')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href')
    })).filter(a => a.text);

    // Get buttons
    const buttons = Array.from(document.querySelectorAll('button, a[class*="button"], a[data-framer-name*="Button"]')).map(b => ({
      text: b.textContent.trim().replace(/\s+/g, ' '),
      bg: window.getComputedStyle(b).backgroundColor,
      color: window.getComputedStyle(b).color,
      border: window.getComputedStyle(b).border,
      radius: window.getComputedStyle(b).borderRadius
    })).filter(b => b.text).slice(0, 15);

    // Get main visual sections / backgrounds
    const sections = Array.from(document.querySelectorAll('section, footer, main > div, div[class*="framer-"]')).map(s => {
      const style = window.getComputedStyle(s);
      const rect = s.getBoundingClientRect();
      return {
        tag: s.tagName,
        className: s.className.slice(0, 60),
        bg: style.backgroundColor,
        bgImg: style.backgroundImage.slice(0, 60),
        height: Math.round(rect.height),
        y: Math.round(rect.top + window.scrollY)
      };
    }).filter(s => s.height > 100).slice(0, 20);

    return {
      title: document.title,
      headings,
      navLinks,
      buttons,
      sections
    };
  });

  // Extract structure from Klay
  const klayData = await pageKlay.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"], p')).map(h => ({
      tag: h.tagName,
      text: h.textContent.trim().replace(/\s+/g, ' ').slice(0, 100),
      fontSize: window.getComputedStyle(h).fontSize,
      fontWeight: window.getComputedStyle(h).fontWeight,
      color: window.getComputedStyle(h).color,
      rect: { y: Math.round(h.getBoundingClientRect().top + window.scrollY), height: Math.round(h.getBoundingClientRect().height) }
    })).filter(h => h.text.length > 3 && h.rect.height > 0).slice(0, 40);

    const navLinks = Array.from(document.querySelectorAll('header a, nav a')).map(a => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href')
    })).filter(a => a.text);

    const buttons = Array.from(document.querySelectorAll('button, a[class*="button"], a[class*="EquitifyButton"], a[class*="rounded-full"]')).map(b => ({
      text: b.textContent.trim().replace(/\s+/g, ' '),
      bg: window.getComputedStyle(b).backgroundColor,
      color: window.getComputedStyle(b).color,
      border: window.getComputedStyle(b).border,
      radius: window.getComputedStyle(b).borderRadius
    })).filter(b => b.text).slice(0, 15);

    return {
      title: document.title,
      headings,
      navLinks,
      buttons
    };
  });

  // Take screenshot of Equitify top 3 viewport folds
  console.log('Taking fold screenshots of Equitify...');
  await pageEquitify.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/equitify_fold1.png', fullPage: false });
  await pageEquitify.evaluate(() => window.scrollBy(0, 900));
  await pageEquitify.waitForTimeout(500);
  await pageEquitify.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/equitify_fold2.png', fullPage: false });
  await pageEquitify.evaluate(() => window.scrollBy(0, 900));
  await pageEquitify.waitForTimeout(500);
  await pageEquitify.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/equitify_fold3.png', fullPage: false });

  // Take screenshot of Klay top 3 viewport folds
  console.log('Taking fold screenshots of Klay...');
  await pageKlay.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/klay_fold1.png', fullPage: false });
  await pageKlay.evaluate(() => window.scrollBy(0, 900));
  await pageKlay.waitForTimeout(500);
  await pageKlay.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/klay_fold2.png', fullPage: false });
  await pageKlay.evaluate(() => window.scrollBy(0, 900));
  await pageKlay.waitForTimeout(500);
  await pageKlay.screenshot({ path: '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/klay_fold3.png', fullPage: false });

  fs.writeFileSync(
    '/Users/hayaat/.gemini/antigravity/brain/5c696a02-b0a4-4d25-8bf2-358775773480/comparison_data.json',
    JSON.stringify({ equitify: equitifyData, klay: klayData }, null, 2)
  );

  await browser.close();
  console.log('Comparison complete!');
}

runComparison().catch(err => {
  console.error('Error running comparison:', err);
  process.exit(1);
});
