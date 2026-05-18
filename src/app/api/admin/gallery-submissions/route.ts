import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'לא מחובר כאדמין' }, { status: 401 });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM gallery_submissions ORDER BY created_at DESC'
    );
    return NextResponse.json({ success: true, submissions: result.rows });
  } catch (error) {
    console.error('Get gallery submissions error:', error);
    return NextResponse.json({ success: false, error: 'שגיאה בטעינת ההגשות' }, { status: 500 });
  }
}
