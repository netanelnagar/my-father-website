import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC"
    );

    return NextResponse.json({
      success: true,
      reviews: result.rows || [],
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'שגיאה בטעינת הביקורות' },
      { status: 500 }
    );
  }
}