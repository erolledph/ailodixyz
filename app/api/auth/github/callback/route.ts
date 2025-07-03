import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    const userData = await userResponse.json();
    
    // Check if user is authorized
    const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
    if (userData.login !== adminUsername) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=unauthorized`);
    }

    // Create session
    const sessionData = {
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      timestamp: Date.now(),
    };

    const cookieStore = cookies();
    cookieStore.set('cms-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/cms-admin`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}?error=auth_failed`);
  }
}