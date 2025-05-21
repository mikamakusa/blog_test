import { NextRequest, NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');

    // Build the query URL - using the exact same structure as your working curl command
    let url = `${STRAPI_URL}/api/ads`;
    
    console.log('Initial request URL:', url);
    console.log('Position filter:', position);
    console.log('Using token:', STRAPI_TOKEN ? 'Token exists' : 'No token found');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi response error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to fetch ads from Strapi: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Strapi response:', JSON.stringify(data, null, 2));
    
    // Check if we have any ads in the response
    if (!data.data || !Array.isArray(data.data)) {
      console.log('No ads found in response or invalid data structure');
      return NextResponse.json([]);
    }

    // Filter by position if specified
    let filteredAds = data.data;
    if (position) {
      filteredAds = data.data.filter((ad: any) => {
        console.log('Checking ad position:', {
          adId: ad.id,
          adPosition: ad.position,
          requestedPosition: position,
          matches: ad.position === position
        });
        return ad.position === position;
      });
      console.log(`Filtered ads for position "${position}":`, filteredAds);
    }

    // Transform the data to match our frontend needs
    const ads = filteredAds.map((item: any) => {
      // Clean up the image URL - remove Joomla-specific parts
      let imageUrl = item.image_url;
      if (imageUrl && imageUrl.includes('#joomlaImage:')) {
        imageUrl = imageUrl.split('#joomlaImage:')[0];
      }

      const transformedAd = {
        id: item.id,
        title: item.title,
        description: item.description,
        image_url: imageUrl,
        target_url: item.target_url,
        position: item.position,
        priority: item.priority,
        is_active: item.is_active,
        start_date: item.start_date,
        end_date: item.end_date,
      };
      console.log('Transformed ad:', transformedAd);
      return transformedAd;
    });

    console.log('Final transformed ads:', ads);
    return NextResponse.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 