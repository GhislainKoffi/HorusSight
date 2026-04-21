import { NextResponse } from 'next/server';
import { users } from '@/lib/store';

export async function POST(request: Request) {
  const { identity, password } = await request.json();
  
  const user = users.find(u => (u.username === identity || u.email === identity) && u.password === password);

  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const { password: _, ...userWithoutPassword } = user;

  return NextResponse.json({
    token: `mock_token_${user.id}`,
    user: userWithoutPassword
  });
}


