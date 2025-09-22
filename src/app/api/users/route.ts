import { NextRequest, NextResponse } from 'next/server';
import { userService } from '../../../lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as 'customer' | 'employee' | null;
    const id = searchParams.get('id');

    if (id) {
      const user = await userService.getById(id);
      return NextResponse.json(user);
    }

    if (role) {
      const users = await userService.getByRole(role);
      return NextResponse.json(users);
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
