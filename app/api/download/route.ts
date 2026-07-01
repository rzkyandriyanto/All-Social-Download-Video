import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse("Failed to fetch media from the source", { status: response.status });
    }

    // Clone headers from the original response
    const headers = new Headers(response.headers);
    
    // Force the browser to download the file instead of playing it
    // We try to keep the original content type, usually video/mp4
    const contentType = headers.get("content-type") || "application/octet-stream";
    
    // Extract extension from content-type if possible, default to mp4
    let ext = "mp4";
    if (contentType.includes("audio")) ext = "mp3";
    else if (contentType.includes("webm")) ext = "webm";
    
    headers.set("Content-Disposition", `attachment; filename="DASH-Media.${ext}"`);

    // Stream the body directly to the client
    return new NextResponse(response.body, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Error proxying the file", { status: 500 });
  }
}
