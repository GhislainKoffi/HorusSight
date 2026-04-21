import { NextRequest, NextResponse } from 'next/server';
import { scans } from '@/lib/store';

// Helper to extract user ID from mock token
const getUserId = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_token_')) {
    return authHeader.replace('Bearer mock_token_', '');
  }
  return 'system';
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserId(req);
  
  // Find the scan by ID and verify owner
  const scan = scans.find((s: any) => s.id === id && s.userId === userId);
  
  if (!scan) {
    return NextResponse.json({ error: 'Scan not found or access denied' }, { status: 404 });
  }

  return NextResponse.json(scan);
}
