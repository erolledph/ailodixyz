import type { BlogPost } from '@/types/blog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ailodixyz.erolledph.workers.dev/cms/data/content.json';

interface SearchResult {
  posts: BlogPost[];
  hasError: boolean;
  errorMessage?: string;
}

// Helper function to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

// Helper function to read local content file
async function readLocalContent(): Promise<BlogPost[]> {
  try {
    // Check if we're in a Node.js environment (build time)
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const contentPath = path.join(process.cwd(), 'public/cms/data/content.json');
      
      if (fs.existsSync(contentPath)) {
        const content = fs.readFileSync(contentPath, 'utf8');
        const data = JSON.parse(content);
        if (Array.isArray(data)) {
          console.log('📚 Using local CMS content (build time)');
          return data.filter((post: any) => post && post.status === 'published');
        }
      }
    } else {
      // Browser environment - try to fetch local content
      try {
        const response = await fetch('/cms/data/content.json');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            console.log('📚 Using local CMS content (browser)');
            return data.filter((post: any) => post && post.status === 'published');
          }
        }
      } catch (error) {
        console.log('📚 Local CMS content not available in browser');
      }
    }
  } catch (error) {
    console.log('📚 Local content not available:', getErrorMessage(error));
  }
  return [];
}

async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  retries = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      // Remove cache-busting parameters to ensure static URL
      const cleanUrl = new URL(url);
      cleanUrl.searchParams.delete('_t');
      cleanUrl.searchParams.delete('_r');
      const staticUrl = cleanUrl.toString();
      
      // Filter out dynamic cache headers from options
      const filteredHeaders = { ...options.headers };
      if (filteredHeaders && typeof filteredHeaders === 'object') {
        delete (filteredHeaders as any)['Cache-Control'];
        delete (filteredHeaders as any)['Pragma'];
        delete (filteredHeaders as any)['Expires'];
      }
      
      // Use static fetch configuration for build-time caching
      const response = await fetch(staticUrl, {
        ...options,
        cache: 'force-cache', // Force static caching for build
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AI-Lodi-Blog/1.0',
          ...filteredHeaders,
        },
      });
      
      if (!response.ok) {
        console.warn(`⚠️ API request failed with status ${response.status}`);
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }
        // For client errors, return empty array instead of throwing
        return new Response('[]', { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('⚠️ API response is not JSON, likely HTML error page');
        throw new Error('Invalid content type - expected JSON');
      }
      
      return response;
    } catch (err) {
      console.error(`🔄 Fetch attempt ${i + 1} failed:`, getErrorMessage(err));
      if (i === retries - 1) {
        // Return empty array instead of throwing
        return new Response('[]', { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw new Error('Max retries reached');
}

export async function getAllContent(options: RequestInit = {}): Promise<BlogPost[]> {
  try {
    console.log('🔄 Fetching content...');
    
    // Try local content first (prioritize during build time)
    const localContent = await readLocalContent();
    if (localContent.length > 0) {
      console.log(`📚 Successfully loaded ${localContent.length} posts from local content`);
      return localContent.sort((a: BlogPost, b: BlogPost) => 
        new Date(b.updatedAt || b.publishDate).getTime() - new Date(a.updatedAt || a.publishDate).getTime()
      );
    }
    
    // Fallback to API if local content is not available
    console.log('🔄 Local content not available, trying API...');
    const response = await fetchWithRetry(API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AI-Lodi-Blog/1.0',
      },
      ...options,
    });
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Failed to parse API response as JSON:', getErrorMessage(parseError));
      console.log('📄 Response preview:', text.substring(0, 200) + '...');
      return [];
    }
    
    // Validate data structure
    if (!Array.isArray(data)) {
      console.error('❌ API returned non-array data:', typeof data);
      return [];
    }
    
    const publishedPosts = data.filter((post: any) => {
      // Validate post structure
      if (!post || typeof post !== 'object') return false;
      if (!post.id || !post.title || !post.slug || post.status !== 'published') return false;
      return true;
    });
    
    console.log(`📚 Successfully fetched ${publishedPosts.length} published posts from API`);
    if (publishedPosts.length > 0) {
      console.log(`📝 Latest posts:`, publishedPosts.slice(0, 3).map((p: BlogPost) => p.title));
    }
    
    // Sort by updated date to ensure consistent ordering
    const sortedPosts = publishedPosts.sort((a: BlogPost, b: BlogPost) => 
      new Date(b.updatedAt || b.publishDate).getTime() - new Date(a.updatedAt || a.publishDate).getTime()
    );
    
    return sortedPosts;
  } catch (error) {
    console.error('❌ Error fetching content:', getErrorMessage(error));
    return [];
  }
}

export async function getContentBySlug(slug: string): Promise<BlogPost | null> {
  try {
    console.log(`🔍 Fetching content for slug: ${slug}`);
    
    // Try local content first
    const localContent = await readLocalContent();
    if (localContent.length > 0) {
      const post = localContent.find((p: BlogPost) => p.slug === slug);
      if (post) {
        console.log(`✅ Found local post: ${post.title}`);
        return post;
      }
    }
    
    // Fallback to API
    const response = await fetchWithRetry(API_URL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AI-Lodi-Blog/1.0',
      },
    });
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Failed to parse API response as JSON for slug fetch:', getErrorMessage(parseError));
      return null;
    }
    
    if (!Array.isArray(data)) {
      console.error('❌ API returned non-array data for slug fetch');
      return null;
    }
    
    const publishedPosts = data.filter((post: any) => 
      post && typeof post === 'object' && post.status === 'published'
    );
    
    const post = publishedPosts.find((p: BlogPost) => p.slug === slug);
    
    if (post) {
      console.log(`✅ Found post: ${post.title}`);
    } else {
      console.log(`❌ Post not found for slug: ${slug}`);
      console.log(`📋 Available slugs:`, publishedPosts.map((p: BlogPost) => p.slug).slice(0, 10));
    }
    
    return post || null;
  } catch (error) {
    console.error('❌ Error fetching content by slug:', getErrorMessage(error));
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  try {
    const posts = await getAllContent();
    return posts.filter(post => post.categories.includes(category));
  } catch (error) {
    console.error('Error fetching posts by category:', getErrorMessage(error));
    return [];
  }
}

// Helper function to normalize text for better matching
function normalizeText(text: string): string {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Helper function to calculate similarity score between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = normalizeText(str1).split(' ');
  const words2 = normalizeText(str2).split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Enhanced search function with proper error handling
export async function searchPosts(query: string): Promise<SearchResult> {
  console.log('🔍 SEARCH DEBUG: Starting search with query:', query);
  
  try {
    const posts = await getAllContent();
    console.log('📚 SEARCH DEBUG: Fetched posts from API:', posts.length, 'posts');
    
    // Log first few post titles for verification
    if (posts.length > 0) {
      console.log('📝 SEARCH DEBUG: Sample post titles:', posts.slice(0, 3).map((p: BlogPost) => p.title));
    }
    
    if (!query.trim()) {
      console.log('⚠️ SEARCH DEBUG: Empty query, returning all posts');
      return {
        posts,
        hasError: false
      };
    }
    
    const normalizedQuery = normalizeText(query);
    const searchTerms = normalizedQuery.split(' ').filter(term => term.length > 0);
    
    console.log('🔤 SEARCH DEBUG: Original query:', query);
    console.log('🔤 SEARCH DEBUG: Normalized query:', normalizedQuery);
    console.log('🔤 SEARCH DEBUG: Search terms:', searchTerms);
    
    // Score each post based on relevance
    const scoredPosts = posts.map(post => {
      let score = 0;
      const normalizedTitle = normalizeText(post.title);
      const normalizedDescription = normalizeText(post.metaDescription);
      const normalizedContent = normalizeText(post.content);
      const normalizedTags = post.tags.map(tag => normalizeText(tag));
      const normalizedCategories = post.categories.map(cat => normalizeText(cat));
      
      // Exact phrase matches (highest priority)
      if (normalizedTitle.includes(normalizedQuery)) score += 100;
      if (normalizedDescription.includes(normalizedQuery)) score += 80;
      if (normalizedContent.includes(normalizedQuery)) score += 40;
      
      // Individual keyword matches
      for (const term of searchTerms) {
        if (term.length < 2) continue; // Skip very short terms
        
        // Title matches (high priority)
        if (normalizedTitle.includes(term)) score += 20;
        
        // Description matches
        if (normalizedDescription.includes(term)) score += 15;
        
        // Tag exact matches
        if (normalizedTags.some(tag => tag === term)) score += 25;
        
        // Tag partial matches
        if (normalizedTags.some(tag => tag.includes(term))) score += 15;
        
        // Category exact matches
        if (normalizedCategories.some(cat => cat === term)) score += 25;
        
        // Category partial matches
        if (normalizedCategories.some(cat => cat.includes(term))) score += 15;
        
        // Content matches (lower priority)
        const contentMatches = (normalizedContent.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(contentMatches * 2, 10); // Cap content score
      }
      
      // Fuzzy matching for title and description
      const titleSimilarity = calculateSimilarity(normalizedQuery, normalizedTitle);
      const descriptionSimilarity = calculateSimilarity(normalizedQuery, normalizedDescription);
      
      if (titleSimilarity > 0.3) score += titleSimilarity * 30;
      if (descriptionSimilarity > 0.3) score += descriptionSimilarity * 20;
      
      // Bonus for multiple term matches
      const matchingTerms = searchTerms.filter(term => 
        normalizedTitle.includes(term) || 
        normalizedDescription.includes(term) || 
        normalizedTags.some(tag => tag.includes(term)) ||
        normalizedCategories.some(cat => cat.includes(term))
      );
      
      if (matchingTerms.length > 1) {
        score += matchingTerms.length * 10;
      }
      
      return { post, score, normalizedTitle, normalizedDescription };
    });
    
    console.log('📊 SEARCH DEBUG: Scored posts sample:');
    scoredPosts.slice(0, 5).forEach(({ post, score, normalizedTitle }) => {
      console.log(`  - "${post.title}" (normalized: "${normalizedTitle}") - Score: ${score}`);
    });
    
    // Filter posts with score > 0 and sort by score (descending)
    const filteredPosts = scoredPosts
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ post }) => post);
    
    console.log('✅ SEARCH DEBUG: Final filtered posts count:', filteredPosts.length);
    
    if (filteredPosts.length === 0) {
      console.log('❌ SEARCH DEBUG: No posts found! Showing top 5 scores for debugging:');
      const topScores = scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      topScores.forEach(({ post, score, normalizedTitle, normalizedDescription }) => {
        console.log(`  - "${post.title}"`);
        console.log(`    Normalized title: "${normalizedTitle}"`);
        console.log(`    Normalized description: "${normalizedDescription}"`);
        console.log(`    Score: ${score}`);
        console.log(`    Categories: ${post.categories.join(', ')}`);
        console.log(`    Tags: ${post.tags.join(', ')}`);
        console.log('    ---');
      });
    } else {
      console.log('🎯 SEARCH DEBUG: Top 3 results:');
      filteredPosts.slice(0, 3).forEach((post, index) => {
        console.log(`  ${index + 1}. "${post.title}"`);
      });
    }
    
    return {
      posts: filteredPosts,
      hasError: false
    };
  } catch (error) {
    console.error('❌ SEARCH DEBUG: Error in searchPosts:', getErrorMessage(error));
    return {
      posts: [],
      hasError: true,
      errorMessage: getErrorMessage(error)
    };
  }
}

// Legacy function for backward compatibility - will be removed in future versions
export async function searchPostsLegacy(query: string): Promise<BlogPost[]> {
  const result = await searchPosts(query);
  return result.posts;
}
