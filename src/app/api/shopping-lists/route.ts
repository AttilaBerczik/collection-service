import { NextRequest, NextResponse } from 'next/server';
import { shoppingListService } from '../../../lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const employeeId = searchParams.get('employeeId');

    if (customerId) {
      const lists = await shoppingListService.getByCustomerId(customerId);
      return NextResponse.json(lists);
    }

    if (employeeId) {
      const lists = await shoppingListService.getByEmployeeId(employeeId);
      return NextResponse.json(lists);
    }

    const lists = await shoppingListService.getAll();
    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
    return NextResponse.json({ error: 'Failed to fetch shopping lists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const shoppingList = await request.json();
    const success = await shoppingListService.create(shoppingList);
    
    if (success) {
      return NextResponse.json({ message: 'Shopping list created successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to create shopping list' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating shopping list:', error);
    return NextResponse.json({ error: 'Failed to create shopping list' }, { status: 500 });
  }
}
