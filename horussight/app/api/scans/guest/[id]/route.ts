import { NextRequest, NextResponse } from 'next/server';
import { scans } from '@/lib/store';

// GET /api/scans/guest/[id] — fetch a guest scan by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Find the scan by ID (string comparison)
  const scan = scans.find((s: any) => s.id === id);
  
  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  return NextResponse.json(scan);
}
