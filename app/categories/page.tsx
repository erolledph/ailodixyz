'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FolderOpen, FileText, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedBlogCard } from '@/components/enhanced-blog-card';
import { getAllContent } from '@/lib/content';
import type { BlogPost } from '@/types/blog';

interface CategoryData {
  name: string;
  count: number;
  posts: BlogPost[];
}

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(filterParam);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const publishedPosts = await getAllContent();
        
        const categoryMap = new Map<string, BlogPost[]>();
        
        publishedPosts.forEach((post: BlogPost) => {
          post.categories.forEach(category => {
            if (!categoryMap.has(category)) {
              categoryMap.set(category, []);
            }
            categoryMap.get(category)!.push(post);
          });
        });
        
        const categoryData = Array.from(categoryMap.entries()).map(([name, posts]) => ({
          name,
          count: posts.length,
          posts: posts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()),
        })).sort((a, b) => b.count - a.count);
        
        setCategories(categoryData);
        setFilteredCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    setFilteredCategories(categories);
  }, [categories]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Categories</h1>
          <p className="text-lg text-muted-foreground">Explore articles by category</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If a specific category is selected, show its posts
  if (selectedCategory) {
    const categoryData = categories.find(cat => cat.name === selectedCategory);
    
    if (!categoryData) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-lg text-muted-foreground mb-8">
              The category "{selectedCategory}" could not be found.
            </p>
            <Link 
              href="/categories"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
            >
              <FolderOpen size={18} />
              Browse All Categories
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <FolderOpen size={20} className="text-primary" />
              <span className="text-sm font-medium text-primary">Category</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{selectedCategory}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {categoryData.count} {categoryData.count === 1 ? 'article' : 'articles'} in this category
          </p>
          <div className="mt-6">
            <Link 
              href="/categories"
              className="inline-flex items-center gap-2 text-primary font-medium"
            >
              ← Back to all categories
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {categoryData.posts.map((post, index) => (
            <EnhancedBlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <FolderOpen size={20} className="text-primary" />
            <span className="text-sm font-medium text-primary">Browse Topics</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Categories</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover articles organized by topics and areas of interest. 
          Click on any category to explore related content.
        </p>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter size={32} className="text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">No categories found</h2>
          <p className="text-lg text-muted-foreground">
            No categories are available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <Card 
              key={category.name} 
              className="cursor-pointer shadow-lg border-border/50"
              onClick={() => setSelectedCategory(category.name)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FolderOpen size={24} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-foreground line-clamp-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText size={14} />
                      <span className="text-sm">
                        {category.count} {category.count === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {category.posts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="text-sm text-muted-foreground line-clamp-1"
                    >
                      {post.title}
                    </div>
                  ))}
                  {category.count > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{category.count - 3} more articles
                    </p>
                  )}
                </div>
                
                <Badge variant="secondary" className="w-full justify-center">
                  Explore {category.name}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CategoriesPageLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Categories</h1>
        <p className="text-lg text-muted-foreground">Loading categories...</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded mb-4" />
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesPageLoading />}>
      <CategoriesPageContent />
    </Suspense>
  );
}