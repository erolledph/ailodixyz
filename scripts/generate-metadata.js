const fs = require('fs');
const path = require('path');

// Configuration - Use environment variable for API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ailodixyz.erolledph.workers.dev/cms/data/content.json';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ailodi.xyz';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'AI Lodi';
const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'AI Lodi is your ultimate guide to modern technology, AI breakthroughs, programming trends, and future science.';

// Helper function to read local content file
function readLocalContent() {
  try {
    const contentPath = path.join(process.cwd(), 'public/cms/data/content.json');
    
    if (fs.existsSync(contentPath)) {
      const content = fs.readFileSync(contentPath, 'utf8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        console.log('📚 BUILD: Using local CMS content');
        return data.filter(post => post && post.status === 'published');
      }
    }
  } catch (error) {
    console.log('📚 BUILD: Local content not available:', error.message);
  }
  return [];
}

// Fetch with retry mechanism and explicit cache control
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      // Force fresh fetch with cache busting and unique timestamp
      const cacheBustUrl = `${url}?_t=${Date.now()}&_r=${Math.random()}&_build=${process.env.CF_PAGES_COMMIT_SHA || 'local'}`;
      
      const response = await fetch(cacheBustUrl, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'User-Agent': 'AI-Lodi-Build-Script/1.0',
          'X-Requested-With': 'XMLHttpRequest',
          ...options.headers,
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.warn(`⚠️ BUILD: API request failed with status ${response.status}, continuing with empty data`);
        return { json: () => Promise.resolve([]) };
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ BUILD: API response is not JSON, likely HTML error page');
        return { json: () => Promise.resolve([]) };
      }
      
      return response;
    } catch (err) {
      console.error(`🔄 BUILD: Metadata fetch attempt ${i + 1} failed:`, err);
      if (i === retries - 1) {
        console.warn('⚠️ BUILD: All fetch attempts failed, continuing with empty data');
        return { json: () => Promise.resolve([]) };
      }
      // Exponential backoff with jitter
      await new Promise(res => setTimeout(res, (1000 * (i + 1)) + Math.random() * 1000));
    }
  }
  return { json: () => Promise.resolve([]) };
}

// Generate sitemap.xml
function generateSitemap(posts) {
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/categories/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact/`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacy-policy/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms-of-service/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer/`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Blog post URLs
  const blogPosts = posts.map((post) => {
    const postDate = new Date(post.updatedAt || post.publishDate);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let changeFrequency = 'monthly';
    if (daysSinceUpdate < 7) changeFrequency = 'daily';
    else if (daysSinceUpdate < 30) changeFrequency = 'weekly';
    else if (daysSinceUpdate < 365) changeFrequency = 'monthly';
    else changeFrequency = 'yearly';

    return {
      url: `${BASE_URL}/post/${post.slug}/`,
      lastModified: postDate,
      changeFrequency,
      priority: 0.9,
    };
  });

  // Category pages
  const categoriesArray = posts.flatMap(post => {
    if (Array.isArray(post.categories)) {
      return post.categories;
    } else if (typeof post.categories === 'string') {
      return post.categories.split(',').map(c => c.trim()).filter(Boolean);
    }
    return [];
  });
  const categories = Array.from(new Set(categoriesArray));
  const categoryPages = categories.map((category) => ({
    url: `${BASE_URL}/categories/?filter=${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const allPages = [...staticPages, ...blogPosts, ...categoryPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified.toISOString()}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

// Generate RSS feed
function generateRSSFeed(posts) {
  const latestPosts = posts
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 20);

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${SITE_NAME} - Your Global Tech Insights & AI Innovation Hub</title>
    <description>${SITE_DESCRIPTION}</description>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <managingEditor>hello@ailodi.xyz (AI Lodi Team)</managingEditor>
    <webMaster>hello@ailodi.xyz (AI Lodi Team)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <category>Technology</category>
    <category>Artificial Intelligence</category>
    <category>Programming</category>
    <category>Innovation</category>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/logo.png</url>
      <title>${SITE_NAME}</title>
      <link>${BASE_URL}</link>
      <width>512</width>
      <height>512</height>
    </image>
    ${latestPosts.map(post => {
      const categories = Array.isArray(post.categories) 
        ? post.categories 
        : typeof post.categories === 'string' 
          ? post.categories.split(',').map(c => c.trim()).filter(Boolean)
          : [];
      
      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.metaDescription}]]></description>
      <content:encoded><![CDATA[${post.content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')}]]></content:encoded>
      <link>${BASE_URL}/post/${post.slug}/</link>
      <guid isPermaLink="true">${BASE_URL}/post/${post.slug}/</guid>
      <pubDate>${new Date(post.publishDate).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author}]]></dc:creator>
      ${categories.map(category => `<category><![CDATA[${category}]]></category>`).join('')}
      ${post.featuredImageUrl ? `<enclosure url="${post.featuredImageUrl}" type="image/jpeg"/>` : ''}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

  return rssXml;
}

// Main function
async function generateMetadata() {
  try {
    console.log('🔄 BUILD: Starting metadata generation with enhanced cache busting...');
    console.log('🔄 BUILD: Using API URL:', API_URL);
    console.log('🔄 BUILD: Build environment:', {
      commit: process.env.CF_PAGES_COMMIT_SHA || 'local',
      branch: process.env.CF_PAGES_BRANCH || 'local',
      timestamp: new Date().toISOString()
    });
    
    // Try local content first (prioritize during build time)
    let publishedPosts = readLocalContent();
    
    if (publishedPosts.length === 0) {
      console.log('🔄 BUILD: Local content not available, trying API...');
      const response = await fetchWithRetry(API_URL);
      
      try {
        const data = await response.json();
        
        // Validate and filter data
        if (!Array.isArray(data)) {
          console.warn('⚠️ BUILD: API returned non-array data, using empty array');
          publishedPosts = [];
        } else {
          publishedPosts = data.filter(post => {
            if (!post || typeof post !== 'object') return false;
            if (!post.id || !post.title || !post.slug || post.status !== 'published') return false;
            return true;
          });
        }
      } catch (parseError) {
        console.error('❌ BUILD: Failed to parse API response as JSON:', parseError);
        console.warn('⚠️ BUILD: Using empty posts array due to JSON parse error');
        publishedPosts = [];
      }
    }
    
    console.log(`📚 BUILD: Found ${publishedPosts.length} published posts`);
    if (publishedPosts.length > 0) {
      console.log(`📝 BUILD: Latest posts:`, publishedPosts.slice(0, 5).map(p => `"${p.title}" (${p.slug})`));
    }

    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Generate and write sitemap
    console.log('🗺️ BUILD: Generating sitemap.xml with fresh content...');
    const sitemap = generateSitemap(publishedPosts);
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap, 'utf8');
    console.log('✅ BUILD: sitemap.xml generated successfully');

    // Generate and write RSS feed
    console.log('📡 BUILD: Generating feed.xml with fresh content...');
    const rss = generateRSSFeed(publishedPosts);
    fs.writeFileSync(path.join(publicDir, 'feed.xml'), rss, 'utf8');
    console.log('✅ BUILD: feed.xml generated successfully');

    // Write a build info file for debugging
    const buildInfo = {
      timestamp: new Date().toISOString(),
      postsCount: publishedPosts.length,
      posts: publishedPosts.map(p => ({ title: p.title, slug: p.slug, updatedAt: p.updatedAt })),
      commit: process.env.CF_PAGES_COMMIT_SHA || 'local',
      branch: process.env.CF_PAGES_BRANCH || 'local',
      apiUrl: API_URL,
      contentSource: publishedPosts.length > 0 ? 'local' : 'api'
    };
    fs.writeFileSync(path.join(publicDir, 'build-info.json'), JSON.stringify(buildInfo, null, 2), 'utf8');
    console.log('📋 BUILD: build-info.json generated for debugging');

    console.log('🎉 BUILD: All metadata files generated successfully with fresh content!');
  } catch (error) {
    console.error('❌ BUILD: Error generating metadata:', error);
    // Don't exit with error code to prevent build failure
    console.warn('⚠️ BUILD: Continuing build despite metadata generation error');
  }
}

// Run the script
generateMetadata();