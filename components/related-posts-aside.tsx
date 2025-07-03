'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BlogPost } from '@/types/blog';

interface RelatedPostsAsideProps {
  currentPostId?: string;
  categories?: string[];
}

export function RelatedPostsAside({ currentPostId, categories = [] }: RelatedPostsAsideProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        const response = await fetch('https://blogform.netlify.app/api/content.json');
        const data = await response.json();
        
        let filteredPosts = data.filter((post: BlogPost) => 
          post.status === 'published' && post.id !== currentPostId
        );

        // If categories are provided, prioritize posts with matching categories
        if (categories.length > 0) {
          const relatedPosts = filteredPosts.filter((post: BlogPost) =>
            post.categories.some(category => categories.includes(category))
          );
          
          const otherPosts = filteredPosts.filter((post: BlogPost) =>
            !post.categories.some(category => categories.includes(category))
          );
          
          filteredPosts = [...relatedPosts, ...otherPosts];
        }

        // Sort by publish date and take first 6
        const sortedPosts = filteredPosts
          .sort((a: BlogPost, b: BlogPost) => 
            new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
          )
          .slice(0, 6);

        setPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedPosts();
  }, [currentPostId, categories]);

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <TrendingUp size={18} className="text-primary" />
            Related Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse medium-card">
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded mb-3"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <TrendingUp size={18} className="text-primary" />
          Related Articles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/post/${post.slug}`}>
            <Card className="medium-card transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                {/* Featured Image */}
                {post.featuredImageUrl && (
                  <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
                    <Image
                      src={post.featuredImageUrl}
                      alt={post.title}
                      width={300}
                      height={128}
                      className="w-full h-full object-cover"
                      sizes="300px"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="space-y-2">
                  {/* Category Badge */}
                  {post.categories.length > 0 && (
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {post.categories[0]}
                      </span>
                    </div>
                  )}
                  
                  {/* Title */}
                  <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                    {post.title}
                  </h4>
                  
                  {/* Meta Information */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(post.publishDate), 'MMM d')}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{Math.ceil(post.content.split(' ').length / 200)} min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}