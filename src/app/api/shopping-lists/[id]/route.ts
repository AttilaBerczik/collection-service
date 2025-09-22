import { NextRequest, NextResponse } from 'next/server';
import { shoppingListService } from '../../../../lib/services';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action, itemId, status } = await request.json();
    const { id: listId } = await params;

    if (action === 'updateItemStatus' && itemId && status) {
      const success = await shoppingListService.updateItemStatus(listId, itemId, status);
      if (success) {
        return NextResponse.json({ message: 'Item status updated successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to update item status' }, { status: 500 });
      }
    }

    if (action === 'updateStatus' && status) {
      const success = await shoppingListService.updateStatus(listId, status);
      if (success) {
        return NextResponse.json({ message: 'List status updated successfully' });
      } else {
        return NextResponse.json({ error: 'Failed to update list status' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return NextResponse.json({ error: 'Failed to update shopping list' }, { status: 500 });
  }
}
