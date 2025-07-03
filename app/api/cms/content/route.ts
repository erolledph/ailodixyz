import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { BlogPost } from '@/types/blog';

// Check authentication
function checkAuth() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('cms-session');
  
  if (!sessionCookie) {
    return false;
  }

  try {
    const sessionData = JSON.parse(sessionCookie.value);
    const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
    return sessionData.username === adminUsername;
  } catch {
    return false;
  }
}

// GET - Read content from GitHub
export async function GET(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = process.env.GITHUB_CONTENT_PATH || 'public/cms/data/content.json';
    const token = process.env.GITHUB_REPO_PAT;

    if (!owner || !repo || !token) {
      throw new Error('GitHub configuration missing');
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Lodi-CMS/1.0',
        },
      }
    );

    if (response.status === 404) {
      // File doesn't exist yet, return empty array
      return NextResponse.json([]);
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const jsonData = JSON.parse(content);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading content from GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to read content' },
      { status: 500 }
    );
  }
}

// POST - Write content to GitHub
export async function POST(request: NextRequest) {
  if (!checkAuth()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentData: BlogPost[] = await request.json();
    
    const owner = process.env.GITHUB_REPO_OWNER;
    const repo = process.env.GITHUB_REPO_NAME;
    const path = process.env.GITHUB_CONTENT_PATH || 'public/cms/data/content.json';
    const token = process.env.GITHUB_REPO_PAT;

    if (!owner || !repo || !token) {
      throw new Error('GitHub configuration missing');
    }

    // First, get the current file to get its SHA (required for updates)
    let sha: string | undefined;
    try {
      const currentResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Lodi-CMS/1.0',
          },
        }
      );

      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        sha = currentData.sha;
      }
    } catch (error) {
      // File might not exist yet, which is fine
      console.log('File does not exist yet, will create new file');
    }

    // Prepare the content
    const jsonContent = JSON.stringify(contentData, null, 2);
    const base64Content = Buffer.from(jsonContent, 'utf-8').toString('base64');

    // Create or update the file
    const updateData: any = {
      message: `Update content via CMS - ${new Date().toISOString()}`,
      content: base64Content,
      branch: 'main', // or your default branch
    };

    if (sha) {
      updateData.sha = sha;
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Lodi-CMS/1.0',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`GitHub API error: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await updateResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      commit: result.commit,
      message: 'Content updated successfully' 
    });
  } catch (error) {
    console.error('Error writing content to GitHub:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}