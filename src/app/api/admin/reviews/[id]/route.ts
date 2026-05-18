import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { verifyAdminToken } from '@/lib/auth';
import { pool } from '@/lib/db';
import { pendingUploadsDir, movePendingFileToPublic } from '@/lib/uploadImages';
import { revalidateTag } from 'next/cache';



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'לא מחובר כאדמין' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const status: string = body?.status;

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ success: false, error: 'סטטוס לא חוקי' }, { status: 400 });
    }

    const review = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);
    if (review.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'ביקורת לא נמצאה' }, { status: 404 });
    }

    const row = review.rows[0];

    if (status === 'approved' && row.image_filename) {
      const pendingPath = path.join(pendingUploadsDir, row.image_filename);
      if (existsSync(pendingPath)) {
        await movePendingFileToPublic(row.image_filename);
      }
    }

    if (status === 'rejected' && row.image_filename) {
      const pendingPath = path.join(pendingUploadsDir, row.image_filename);
      if (existsSync(pendingPath)) {
        await unlink(pendingPath).catch(() => {});
      }
    }

    const result = await pool.query(
      'UPDATE reviews SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (status === 'approved') {
      revalidateTag('reviews', 'max');
    }

    return NextResponse.json({ success: true, review: result.rows[0] });
  } catch (error) {
    console.error('Patch review error:', error);
    return NextResponse.json({ success: false, error: 'שגיאה בעדכון הביקורת' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'לא מחובר כאדמין' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Get the review to delete associated image file
    const review = await pool.query('SELECT * FROM reviews WHERE id = $1', [id]);

    if (review.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ביקורת לא נמצאה' },
        { status: 404 }
      );
    }

    // Delete image file if exists
    if (review.rows[0].image_filename) {
      const imagePath = path.join(process.cwd(), 'public', review.rows[0].image_filename);
      if (existsSync(imagePath)) {
        await unlink(imagePath);
      }
    }

    // Delete from database
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    return NextResponse.json({
      success: true,
      message: 'הביקורת נמחקה בהצלחה'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { success: false, error: 'שגיאה במחיקת הביקורת' },
      { status: 500 }
    );
  }
}