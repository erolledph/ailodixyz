'use client';

import { Suspense, useEffect, useState } from 'react';

function GATestContent() {
  const [gaStatus, setGaStatus] = useState<{
    gaId: string | null;
    gtagAvailable: boolean;
    dataLayerAvailable: boolean;
    scriptsLoaded: boolean;
  }>({
    gaId: null,
    gtagAvailable: false,
    dataLayerAvailable: false,
    scriptsLoaded: false,
  });

  useEffect(() => {
    // Check GA status
    const checkGA = () => {
      const status = {
        gaId: process.env.NEXT_PUBLIC_GA_ID || null,
        gtagAvailable: typeof window.gtag === 'function',
        dataLayerAvailable: Array.isArray(window.dataLayer),
        scriptsLoaded: !!document.querySelector('script[src*="googletagmanager.com"]'),
      };
      
      setGaStatus(status);
      
      console.log('🔍 GA Test Results:', status);
    };

    // Check immediately and after a delay to ensure scripts have loaded
    checkGA();
    const timer = setTimeout(checkGA, 2000);

    return () => clearTimeout(timer);
  }, []);

  const sendTestEvent = () => {
    if (window.gtag) {
      window.gtag('event', 'test_event', {
        event_category: 'engagement',
        event_label: 'manual_test',
        value: 1
      });
      console.log('📊 Test event sent to GA');
      alert('Test event sent! Check your browser console and GA Real-Time reports.');
    } else {
      alert('Google Analytics not available!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Google Analytics Test Page</h1>
      
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">GA Status Check</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${gaStatus.gaId ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>GA ID: {gaStatus.gaId || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${gaStatus.gtagAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>gtag function: {gaStatus.gtagAvailable ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${gaStatus.dataLayerAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>dataLayer: {gaStatus.dataLayerAvailable ? 'Available' : 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${gaStatus.scriptsLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>GA Scripts: {gaStatus.scriptsLoaded ? 'Loaded' : 'Not loaded'}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>NEXT_PUBLIC_GA_ID: {process.env.NEXT_PUBLIC_GA_ID || 'Not set'}</div>
            <div>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test GA Event</h2>
          <p className="mb-4 text-muted-foreground">
            Click the button below to send a test event to Google Analytics. 
            Check your browser console and GA Real-Time reports to verify it's working.
          </p>
          <button
            onClick={sendTestEvent}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            disabled={!gaStatus.gtagAvailable}
          >
            Send Test Event
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-2 text-sm">
            <p>1. Make sure NEXT_PUBLIC_GA_ID is set in your Cloudflare environment variables</p>
            <p>2. Redeploy your application after setting the environment variable</p>
            <p>3. Check browser console for any GA-related errors</p>
            <p>4. Verify the GA ID format: G-XXXXXXXXXX</p>
            <p>5. Check Google Analytics Real-Time reports to see if data is coming through</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GATestLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Google Analytics Test Page</h1>
      <div className="animate-pulse space-y-6">
        <div className="bg-muted rounded-lg h-32"></div>
        <div className="bg-muted rounded-lg h-24"></div>
        <div className="bg-muted rounded-lg h-40"></div>
      </div>
    </div>
  );
}

export default function GATestPage() {
  return (
    <Suspense fallback={<GATestLoading />}>
      <GATestContent />
    </Suspense>
  );
}