import { NextResponse } from 'next/server';
import { securityLogs } from '@/lib/store';

// Helper to extract user ID from mock token
const getUserId = (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer mock_token_')) {
    return authHeader.replace('Bearer mock_token_', '');
  }
  return 'system';
};

export async function GET(request: Request) {
  const userId = getUserId(request);
  // Filter security logs by user ID
  return NextResponse.json(securityLogs.filter((log: any) => log.userId === userId));
}
