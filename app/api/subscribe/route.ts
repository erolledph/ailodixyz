import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the email from the request body
    const { email } = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a valid string' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Get LeanCloud credentials from environment variables
    const appId = process.env.NEXT_PUBLIC_VALINE_APP_ID;
    const appKey = process.env.NEXT_PUBLIC_VALINE_APP_KEY;
    const serverUrl = process.env.NEXT_PUBLIC_VALINE_SERVER_URLS;

    if (!appId || !appKey) {
      console.error('Missing LeanCloud credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Construct the LeanCloud API URL
    const baseUrl = serverUrl || 'https://k6ap8izm.api.lncldglobal.com';
    const apiUrl = `${baseUrl}/1.1/classes/Subscription`;

    // Make request to LeanCloud API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LC-Id': appId,
        'X-LC-Key': appKey,
      },
      body: JSON.stringify({
        email: email,
        subscribedAt: new Date().toISOString(),
        source: 'AI Lodi Blog',
        status: 'active'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('LeanCloud API error:', errorData);
      
      // Handle specific LeanCloud errors
      if (errorData.code === 137) {
        return NextResponse.json(
          { error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('Subscription successful:', { objectId: data.objectId, email });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to AI Lodi newsletter!',
        objectId: data.objectId 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
