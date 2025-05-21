'use client';

import { useEffect, useState } from 'react';

interface Ad {
  id: number;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  position: string;
  priority: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

interface AdDisplayProps {
  position?: string;
  limit?: number;
}

export default function AdDisplay({ position, limit = 1 }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log('AdDisplay: Starting fetch for position:', position);
        const url = '/api/ads' + (position ? `?position=${position}` : '');
        console.log('AdDisplay: Fetching from URL:', url);
        
        const response = await fetch(url);
        console.log('AdDisplay: Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('AdDisplay: Response not OK:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          throw new Error('Failed to fetch ads');
        }
        
        const data = await response.json();
        console.log('AdDisplay: Received data:', data);
        
        // Filter active ads within date range
        const now = new Date();
        const activeAds = data.filter((ad: Ad) => {
          const startDate = new Date(ad.start_date);
          const endDate = new Date(ad.end_date);
          // Temporarily only check is_active, ignore date range for testing
          const isActive = ad.is_active;
          console.log('AdDisplay: Ad status:', {
            id: ad.id,
            title: ad.title,
            is_active: ad.is_active,
            start_date: ad.start_date,
            end_date: ad.end_date,
            isActive,
            now: now.toISOString(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          });
          return isActive;
        });

        console.log('AdDisplay: Active ads after filtering:', activeAds);

        // Sort by priority and limit the number
        const sortedAds = activeAds
          .sort((a: Ad, b: Ad) => b.priority - a.priority)
          .slice(0, limit);

        console.log('AdDisplay: Final ads to display:', sortedAds);
        setAds(sortedAds);
      } catch (err) {
        console.error('AdDisplay: Error in fetchAds:', err);
        setError(err instanceof Error ? err.message : 'Failed to load ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [position, limit]);

  if (loading) {
    console.log('AdDisplay: Loading state');
    return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
  }

  if (error) {
    console.log('AdDisplay: Error state', error);
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (ads.length === 0) {
    console.log('AdDisplay: No ads to display');
    return <div className="text-gray-500">No ads available</div>;
  }

  console.log('AdDisplay: Rendering ads', ads);
  return (
    <div className="space-y-4">
      {ads.map((ad) => (
        <div key={ad.id} className="border rounded-lg p-4 bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">{ad.title}</h3>
          <p className="text-gray-600 mb-2">{ad.description}</p>
          <a 
            href={ad.target_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Visit link
          </a>
          <div className="mt-2 text-sm text-gray-500">
            <p>Position: {ad.position}</p>
            <p>Priority: {ad.priority}</p>
            <p>Active: {ad.is_active ? 'Yes' : 'No'}</p>
            <p>Start: {ad.start_date}</p>
            <p>End: {ad.end_date}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 