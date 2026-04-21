import { NextRequest, NextResponse } from 'next/server';
import { scans } from '@/lib/store';
import { getAuthUser } from '@/lib/auth';

// GET /api/scans/guest — initiate a guest scan
export async function POST(req: NextRequest) {
  const { url } = await req.json();

  // Import dynamically to avoid circular deps
  const { performScan } = await import('@/lib/scan');

  const scanId = scans.length + 1;
  const scanData = {
    id: scanId,
    userId: 'guest',
    target: url,
    status: 'In Progress',
    vulnerabilities: [],
    endpoints: [],
    timestamp: new Date().toISOString(),
  };
  scans.push(scanData);

  performScan(url).then((results) => {
    const idx = scans.findIndex((s: any) => s.id === scanId);
    if (idx !== -1) scans[idx] = { ...scans[idx], ...results };
  });

  return NextResponse.json({ id: scanId, status: 'In Progress' });
}
