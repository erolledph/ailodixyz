'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function SEOHead({
  title = 'AI Lodi - Your Global Tech Insights & AI Innovation Hub',
  description = 'AI Lodi is your ultimate guide to modern technology, AI breakthroughs, programming trends, and future science.',
  keywords = [],
  image = '/og-image.jpg',
  url = 'https://ailodi.xyz',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailodi.xyz';
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content={author || 'AI Lodi Team'} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="AI Lodi" />
      <meta property="og:locale" content="en_US" />

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ailodi_tech" />
      <meta name="twitter:creator" content="@ailodi_tech" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#22c55e" />
      <meta name="msapplication-TileColor" content="#22c55e" />
      <meta name="application-name" content="AI Lodi" />
      <meta name="apple-mobile-web-app-title" content="AI Lodi" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.unsplash.com" />
      <link rel="preconnect" href="https://api.dicebear.com" />

      {/* DNS prefetch */}
      <link rel="dns-prefetch" href="https://blogform.netlify.app" />
    </Head>
  );
}