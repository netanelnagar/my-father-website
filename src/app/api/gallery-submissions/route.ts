import { NextRequest, NextResponse } from 'next/server';
import { isImage, uploadPendingFile } from '@/lib/uploadImages';
import { pool } from '@/lib/db';
import { submissionRateLimiter } from '@/lib/limiter';
import { getUserIP } from '@/lib/ip';

export async function POST(request: NextRequest) {
  try {
    const ip = await getUserIP();
    await submissionRateLimiter.consume(ip);
  } catch {
    return NextResponse.json(
      { success: false, error: 'יותר מדי בקשות. נסה שוב בעוד כמה דקות.' },
      { status: 429 }
    );
  }

  try {
    const form = await request.formData();

    const caption = (form.get('caption') as string)?.trim() || null;
    const imageEntry = form.get('image');
    const file = (imageEntry instanceof File && imageEntry.size > 0) ? imageEntry : null;

    if (!caption) {
      return NextResponse.json(
        { success: false, error: 'כותרת התמונה היא שדה חובה' },
        { status: 400 }
      );
    }

    if (caption.length > 255) {
      return NextResponse.json(
        { success: false, error: 'הכותרת ארוכה מדי (מקסימום 255 תווים)' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'יש לבחור קובץ תמונה' },
        { status: 400 }
      );
    }

    if (!isImage(file.name)) {
      return NextResponse.json(
        { success: false, error: 'יש להעלות קובץ תמונה בלבד (PNG, JPG, WEBP וכו\')' },
        { status: 400 }
      );
    }

    const filename = await uploadPendingFile(file);
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'שגיאה בשמירת הקובץ' },
        { status: 500 }
      );
    }

    await pool.query(
      'INSERT INTO gallery_submissions (caption, filename, status) VALUES ($1, $2, $3)',
      [caption, filename, 'pending']
    );

    return NextResponse.json({
      success: true,
      message: 'התמונה שלך התקבלה ותתווסף לגלריה לאחר אישור',
    });
  } catch (error) {
    console.error('Gallery submission error:', error);
    return NextResponse.json(
      { success: false, error: 'שגיאה בשליחת התמונה' },
      { status: 500 }
    );
  }
}
