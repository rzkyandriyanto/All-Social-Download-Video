import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Platform detection logic based on URL
  let detectedPlatform = 'Tidak Diketahui';
  if (url.includes('youtube.com') || url.includes('youtu.be')) detectedPlatform = 'YouTube';
  else if (url.includes('tiktok.com')) detectedPlatform = 'TikTok';
  else if (url.includes('facebook.com') || url.includes('fb.watch')) detectedPlatform = 'Facebook';
  else if (url.includes('instagram.com')) detectedPlatform = 'Instagram';
  else if (url.includes('x.com') || url.includes('twitter.com')) detectedPlatform = 'X (Twitter)';

  try {
    const rapidApiHost = 'social-download-all-in-one.p.rapidapi.com';
    const rapidApiKey = '65b15e06dbmsha7f4aacb5c97a4bp1df400jsn2a474e9d99b0'; // Will be moved to env in production

    const response = await fetch(`https://${rapidApiHost}/v1/social/autolink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': rapidApiHost,
        'x-rapidapi-key': rapidApiKey,
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from RapidAPI, status: ${response.status}`);
    }

    const data = await response.json();
    
    // RapidAPI returns message for errors
    if (data.message) {
       throw new Error(data.message);
    }

    const title = data.title || `Video dari ${detectedPlatform !== 'Tidak Diketahui' ? detectedPlatform : 'URL'}`;
    const description = 'Siap untuk didownload. Resolusi dan kualitas dapat dipilih di bawah.';
    const thumbnail = data.thumbnail || '';
    
    // RapidAPI might detect source differently, but we can trust its medias array
    const medias = data.medias || [];

    return NextResponse.json({
      title,
      description,
      thumbnail,
      platform: data.source || detectedPlatform,
      medias,
    });
  } catch (error: any) {
    console.error("Error fetching metadata from RapidAPI:", error);
    // Graceful fallback for UI error handling
    return NextResponse.json({
      title: 'Gagal Mengambil Data',
      description: error.message || 'Terjadi kesalahan saat memproses link. Pastikan link valid atau coba lagi nanti.',
      thumbnail: '',
      platform: detectedPlatform,
      medias: [],
    }, { status: 500 });
  }
}
