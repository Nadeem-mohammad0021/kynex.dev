import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test the notification endpoint with sample data
    const testData = {
      userId: 'test-user-' + Date.now(),
      email: 'test-user@example.com',
      name: 'Test User',
      provider: 'github',
      signupTime: new Date().toISOString(),
      metadata: {
        source: 'manual-test',
        timestamp: new Date().toISOString()
      }
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002'}/api/notifications/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Notification test failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully! Check your email.',
      testData,
      result
    });

  } catch (error: any) {
    console.error('Test notification failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test notification failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
