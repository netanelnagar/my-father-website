import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { verifyAdminToken } from '@/lib/auth';
import { pool } from '@/lib/db';
import { pendingUploadsDir, movePendingFileToPublic } from '@/lib/uploadImages';

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

    const submission = await pool.query('SELECT * FROM gallery_submissions WHERE id = $1', [id]);
    if (submission.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'הגשה לא נמצאה' }, { status: 404 });
    }

    const row = submission.rows[0];

    if (status === 'approved') {
      const pendingPath = path.join(pendingUploadsDir, row.filename);
      if (existsSync(pendingPath)) {
        await movePendingFileToPublic(row.filename);
      }
    }

    if (status === 'rejected') {
      const pendingPath = path.join(pendingUploadsDir, row.filename);
      if (existsSync(pendingPath)) {
        await unlink(pendingPath).catch(() => {});
      }
    }

    const result = await pool.query(
      'UPDATE gallery_submissions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    return NextResponse.json({ success: true, submission: result.rows[0] });
  } catch (error) {
    console.error('Patch gallery submission error:', error);
    return NextResponse.json({ success: false, error: 'שגיאה בעדכון ההגשה' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'לא מחובר כאדמין' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const submission = await pool.query('SELECT * FROM gallery_submissions WHERE id = $1', [id]);
    if (submission.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'הגשה לא נמצאה' }, { status: 404 });
    }

    const row = submission.rows[0];
    const filePath = path.join(pendingUploadsDir, row.filename);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => {});
    }

    await pool.query('DELETE FROM gallery_submissions WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'ההגשה נמחקה' });
  } catch (error) {
    console.error('Delete gallery submission error:', error);
    return NextResponse.json({ success: false, error: 'שגיאה במחיקת ההגשה' }, { status: 500 });
  }
}
