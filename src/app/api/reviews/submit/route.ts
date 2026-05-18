import { NextRequest, NextResponse } from 'next/server';
import { isImage, isAllowedFileType, uploadPendingFile } from '@/lib/uploadImages';
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

    const name = (form.get('name') as string)?.trim() || null;
    const ratingVal = form.get('rating');
    const rating = ratingVal ? Number(ratingVal) : null;
    const content = (form.get('content') as string)?.trim() || null;

    const imageEntry = form.get('image');
    const file = (imageEntry instanceof File && imageEntry.size > 0) ? imageEntry : null;

    if (!name || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'שם, דירוג ותוכן הם שדות חובה' },
        { status: 400 }
      );
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'דירוג חייב להיות בין 1 ל-5' },
        { status: 400 }
      );
    }

    if (content.length < 10) {
      return NextResponse.json(
        { success: false, error: 'תוכן הביקורת חייב להיות לפחות 10 תווים' },
        { status: 400 }
      );
    }

    let imageFilename: string | null = null;

    if (file) {
      if (!isAllowedFileType(file.name) || !isImage(file.name)) {
        return NextResponse.json(
          { success: false, error: 'סוג הקובץ לא נתמך. יש להעלות תמונה בלבד.' },
          { status: 400 }
        );
      }
      imageFilename = await uploadPendingFile(file);
    }

    await pool.query(
      'INSERT INTO reviews (name, rating, content, image_filename, status) VALUES ($1, $2, $3, $4, $5)',
      [name, rating, content, imageFilename, 'pending']
    );

    return NextResponse.json({
      success: true,
      message: 'הביקורת שלך התקבלה ותפורסם לאחר אישור',
    });
  } catch (error) {
    console.error('Public review submit error:', error);
    return NextResponse.json(
      { success: false, error: 'שגיאה בשליחת הביקורת' },
      { status: 500 }
    );
  }
}
