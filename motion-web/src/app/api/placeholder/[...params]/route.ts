import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  const resolvedParams = await params;
  const [width = '400', height = '300'] = resolvedParams.params || [];
  
  // Create a simple placeholder SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="20%" y="20%" width="60%" height="60%" fill="#e5e7eb" rx="8"/>
      <circle cx="40%" cy="40%" r="8%" fill="#d1d5db"/>
      <rect x="35%" y="55%" width="30%" height="8%" fill="#d1d5db" rx="2"/>
      <rect x="30%" y="68%" width="40%" height="6%" fill="#e5e7eb" rx="2"/>
      <text x="50%" y="85%" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">${width}x${height}</text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
