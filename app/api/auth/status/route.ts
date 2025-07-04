export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('cms-session');
    
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify session (in a real app, you'd verify the JWT token)
    const sessionData = JSON.parse(sessionCookie.value);
    const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
    
    if (sessionData.username === adminUsername) {
      return NextResponse.json({ 
        authenticated: true, 
        user: sessionData 
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}