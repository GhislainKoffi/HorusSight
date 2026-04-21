import { NextResponse } from 'next/server';
import { users } from '@/lib/store';

export async function POST(request: Request) {
  const { username, email, password } = await request.json();
  
  if (users.find(u => u.username === username || u.email === email)) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const newUser = { id: `u_${Date.now()}`, username, email };
  users.push({ ...newUser, password });

  return NextResponse.json({
    token: `mock_token_${newUser.id}`,
    user: newUser
  });
}
