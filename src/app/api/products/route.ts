import { NextRequest, NextResponse } from 'next/server';
import { productService } from '../../../lib/services';

export async function GET() {
  try {
    const products = await productService.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
