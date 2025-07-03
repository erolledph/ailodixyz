'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { marked } from 'marked';
import styles from './cms.module.css';
import type { BlogPost } from '@/types/blog';

interface CMSSettings {
  siteTitle: string;
  siteDescription: string;
  defaultAuthor: string;
  defaultStatus: 'draft' | 'published';
}

// Helper function to normalize data from external sources
function normalizeContentData(rawData: any[]): BlogPost[] {
  return rawData.map((item: any) => ({
    ...item,
    categories: Array.isArray(item.categories) 
      ? item.categories 
      : typeof item.categories === 'string' 
        ? item.categories.split(',').map((c: string) => c.trim()).filter(Boolean)
        : [],
    tags: Array.isArray(item.tags) 
      ? item.tags 
      : typeof item.tags === 'string' 
        ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
    keywords: Array.isArray(item.keywords) 
      ? item.keywords 
      : typeof item.keywords === 'string' 
        ? item.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [],
    // Ensure other required fields have defaults
    metaDescription: item.metaDescription || '',
    seoTitle: item.seoTitle || item.title || '',
    author: item.author || '',
    featuredImageUrl: item.featuredImageUrl || '',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    publishDate: item.publishDate || new Date().toISOString(),
  })) as BlogPost[];
}

export default function CMSAdminPage() {
  const router = useRouter();
  const [contentData, setContentData] = useState<BlogPost[]>([]);
  const [filteredData, setFilteredData] = useState<BlogPost[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [settings, setSettings] = useState<CMSSettings>({
    siteTitle: 'AI Lodi CMS',
    siteDescription: 'Content Management System',
    defaultAuthor: '',
    defaultStatus: 'draft'
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    featuredImageUrl: '',
    metaDescription: '',
    seoTitle: '',
    keywords: '',
    author: '',
    categories: '',
    tags: '',
    status: 'draft' as 'draft' | 'published'
  });

  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
      
      if (!data.authenticated) {
        router.push('/api/auth/github/login');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/api/auth/github/login');
      return;
    } finally {
      setCheckingAuth(false);
    }
  };

  // Load content data
  useEffect(() => {
    if (isAuthenticated) {
      loadContentData();
      loadSettings();
    }
  }, [isAuthenticated]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !editingId) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, editingId]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [contentData, filters]);

  const loadContentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cms/content');
      if (response.ok) {
        const rawData = await response.json();
        // Normalize the data to ensure type consistency
        const normalizedData = normalizeContentData(rawData);
        setContentData(normalizedData);
      } else {
        console.warn('Could not load content, starting with empty data');
        setContentData([]);
      }
    } catch (error) {
      console.error('Error loading content data:', error);
      setContentData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('cms-settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('cms-settings', JSON.stringify(settings));
  };

  const applyFilters = () => {
    let filtered = [...contentData];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        (item.author && item.author.toLowerCase().includes(searchLower)) ||
        item.content.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredData(filtered);
  };

  const generateId = () => {
    return 'content-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  };

  const parseCommaSeparated = (value: string): string[] => {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(item => item);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const now = new Date().toISOString();
      
      const contentItem: BlogPost = {
        id: editingId || generateId(),
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        featuredImageUrl: formData.featuredImageUrl || '',
        metaDescription: formData.metaDescription || '',
        seoTitle: formData.seoTitle || formData.title,
        keywords: parseCommaSeparated(formData.keywords),
        author: formData.author || settings.defaultAuthor || '',
        categories: parseCommaSeparated(formData.categories),
        tags: parseCommaSeparated(formData.tags),
        status: formData.status,
        publishDate: now,
        createdAt: editingId ? getExistingItem(editingId)?.createdAt || now : now,
        updatedAt: now
      };

      let updatedData;
      if (editingId) {
        // Update existing content
        updatedData = contentData.map(item => 
          item.id === editingId ? contentItem : item
        );
      } else {
        // Add new content
        updatedData = [...contentData, contentItem];
      }

      // Save to GitHub
      const response = await fetch('/api/cms/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      setContentData(updatedData);
      resetForm();
      setActiveTab('manage');
      showNotification('Content saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving content:', error);
      showNotification('Failed to save content. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const editContent = (id: string) => {
    const item = contentData.find(content => content.id === id);
    if (!item) return;

    setEditingId(id);
    setFormData({
      title: item.title,
      slug: item.slug,
      content: item.content,
      featuredImageUrl: item.featuredImageUrl || '',
      metaDescription: item.metaDescription || '',
      seoTitle: item.seoTitle || '',
      keywords: Array.isArray(item.keywords) ? item.keywords.join(', ') : '',
      author: item.author || '',
      categories: Array.isArray(item.categories) ? item.categories.join(', ') : '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      status: item.status
    });
    setActiveTab('create');
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const updatedData = contentData.filter(item => item.id !== id);
      
      const response = await fetch('/api/cms/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to delete content');
      }

      setContentData(updatedData);
      showNotification('Content deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting content:', error);
      showNotification('Failed to delete content. Please try again.', 'error');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      featuredImageUrl: '',
      metaDescription: '',
      seoTitle: '',
      keywords: '',
      author: '',
      categories: '',
      tags: '',
      status: 'draft'
    });
  };

  const getExistingItem = (id: string) => {
    return contentData.find(item => item.id === id);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      transform: translateX(100%);
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: transform 0.3s ease;
    `;
    
    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    notification.style.backgroundColor = colors[type];
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const exportToJSON = () => {
    if (contentData.length === 0) {
      showNotification('No content to export!', 'warning');
      return;
    }

    const jsonContent = JSON.stringify(contentData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `content-export-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Content exported successfully!', 'success');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (checkingAuth) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  // Statistics - Now using properly typed arrays
  const totalContent = contentData.length;
  const publishedContent = contentData.filter(item => item.status === 'published').length;
  const draftContent = contentData.filter(item => item.status === 'draft').length;
  const allCategories = contentData.flatMap(item => item.categories);
  const uniqueCategories = [...new Set(allCategories)].length;

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <header className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerContent}>
            <h1>{settings.siteTitle}</h1>
            <p>{settings.siteDescription}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button 
            onClick={handleLogout}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Logout
          </button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* Navigation */}
        <nav className={styles.tabNavigation}>
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Dashboard</div>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className={styles.tabIcon}>📊</span>
              <span className={styles.tabText}>Overview</span>
            </button>
          </div>
          
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Content</div>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'manage' ? styles.active : ''}`}
              onClick={() => setActiveTab('manage')}
            >
              <span className={styles.tabIcon}>📁</span>
              <span className={styles.tabText}>Manage Content</span>
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'create' ? styles.active : ''}`}
              onClick={() => setActiveTab('create')}
            >
              <span className={styles.tabIcon}>➕</span>
              <span className={styles.tabText}>Create Content</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className={styles.dashboardContent}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard Overview</h1>
                <p className={styles.pageDescription}>Get insights into your content performance and statistics</p>
              </div>
              
              <div className={styles.overviewCards}>
                <div className={styles.statCard}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statIcon}>📄</div>
                    <div className={styles.statInfo}>
                      <h3>{totalContent}</h3>
                      <p>Total Content</p>
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statInfo}>
                      <h3>{publishedContent}</h3>
                      <p>Published</p>
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statIcon}>📝</div>
                    <div className={styles.statInfo}>
                      <h3>{draftContent}</h3>
                      <p>Drafts</p>
                    </div>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statCardContent}>
                    <div className={styles.statIcon}>🏷️</div>
                    <div className={styles.statInfo}>
                      <h3>{uniqueCategories}</h3>
                      <p>Categories</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.recentContent}>
                <h2>Recent Content</h2>
                <div className={styles.contentList}>
                  {contentData
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className={styles.contentItem}>
                        <div className={styles.contentItemInfo}>
                          <h4>{item.title}</h4>
                          <p>By {item.author || 'Unknown'} • {formatDate(item.updatedAt)}</p>
                        </div>
                        <span className={`${styles.contentStatus} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  {contentData.length === 0 && (
                    <p className={styles.previewPlaceholder}>No content available</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Manage Content</h1>
                <p className={styles.pageDescription}>View, edit, and organize your content library</p>
              </div>
              
              <div className={styles.manageHeader}>
                <div className={styles.manageHeaderContent}>
                  <h2 className={styles.manageTitle}>Content Library</h2>
                  <div className={styles.manageActions}>
                    <div className={styles.filterGroup}>
                      <select 
                        className={styles.filterSelect}
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="all">All Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                      <input 
                        type="text" 
                        className={styles.filterInput}
                        placeholder="Search content..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </div>
                    <div className={styles.actionGroup}>
                      <button 
                        onClick={exportToJSON}
                        className={`${styles.btn} ${styles.btnPrimary}`}
                      >
                        <span className={styles.btnIcon}>📤</span>
                        Export Content
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.contentTable}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Publish Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className={styles.previewPlaceholder}>Loading...</td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className={styles.previewPlaceholder}>
                          {contentData.length === 0 ? 'No content available' : 'No content matches your filters'}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map(item => (
                        <tr key={item.id}>
                          <td>
                            {item.featuredImageUrl ? (
                              <img 
                                src={item.featuredImageUrl} 
                                alt={item.title} 
                                className={styles.contentImage}
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.style.display = 'none';
                                  const nextSibling = target.nextElementSibling as HTMLElement | null;
                                  if (nextSibling) {
                                    nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className={styles.contentImagePlaceholder}
                              style={{ display: item.featuredImageUrl ? 'none' : 'flex' }}
                            >
                              No Image
                            </div>
                          </td>
                          <td><strong>{item.title}</strong></td>
                          <td>
                            <span className={`${styles.contentStatus} ${styles[`status${item.status.charAt(0).toUpperCase() + item.status.slice(1)}`]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>{formatDate(item.publishDate)}</td>
                          <td>
                            <div className={styles.actionButtons}>
                              <button 
                                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                                onClick={() => editContent(item.id)}
                              >
                                Edit
                              </button>
                              <button 
                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                                onClick={() => deleteContent(item.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create Tab */}
          {activeTab === 'create' && (
            <div className={styles.tabContent}>
              <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                  {editingId ? 'Edit Content' : 'Create New Content'}
                </h1>
                <p className={styles.pageDescription}>
                  {editingId ? 'Update your existing content' : 'Add new content to your library with rich formatting support'}
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className={styles.contentForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="title">Title *</label>
                    <input 
                      type="text" 
                      id="title" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="slug">Slug *</label>
                    <input 
                      type="text" 
                      id="slug" 
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="author">Author</label>
                    <input 
                      type="text" 
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="status">Status</label>
                    <select 
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="featuredImageUrl">Featured Image URL</label>
                    <input 
                      type="url" 
                      id="featuredImageUrl"
                      value={formData.featuredImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label htmlFor="metaDescription">Meta Description</label>
                    <textarea 
                      id="metaDescription" 
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="seoTitle">SEO Title</label>
                    <input 
                      type="text" 
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="keywords">Keywords (comma-separated)</label>
                    <input 
                      type="text" 
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="categories">Categories (comma-separated)</label>
                    <input 
                      type="text" 
                      id="categories"
                      value={formData.categories}
                      onChange={(e) => setFormData(prev => ({ ...prev, categories: e.target.value }))}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="tags">Tags (comma-separated)</label>
                    <input 
                      type="text" 
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.contentEditor}>
                  <div className={styles.editorHeader}>
                    <h3>Content (Markdown)</h3>
                  </div>
                  
                  <div className={styles.editorContainer}>
                    <div className={styles.editorPane}>
                      <h4>Markdown Editor</h4>
                      <textarea 
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your content in Markdown..."
                        rows={20}
                      />
                    </div>
                    <div className={styles.editorPane}>
                      <h4>Live Preview</h4>
                      <div className={styles.previewContent}>
                        {formData.content ? (
                          <div dangerouslySetInnerHTML={{ __html: marked(formData.content) }} />
                        ) : (
                          <p className={styles.previewPlaceholder}>Start typing to see your content preview...</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className={`${styles.btn} ${styles.btnPrimary}`}
                  >
                    {saving ? 'Saving...' : editingId ? 'Update Content' : 'Create Content'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}