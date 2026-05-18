import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { isAllowedFileType, uploadFile } from '@/lib/uploadImages';
import { pool } from '@/lib/db';
import { revalidateTag } from 'next/cache';


export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'לא מחובר כאדמין' }, { status: 401 });
  }

  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    return NextResponse.json({ success: true, reviews: result.rows });
  } catch (error) {
    console.error('Get all reviews error:', error);
    return NextResponse.json({ success: false, error: 'שגיאה בטעינת הביקורות' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'לא מחובר כאדמין' },
      { status: 401 }
    );
  }

  try {
    const form = await request.formData();

    const name = (form.get('name') as string) || null;
    const ratingVal = form.get('rating');
    const rating = ratingVal ? Number(ratingVal) : null;
    const content = (form.get('content') as string) || null;
    
    // Handle image safely
    const imageEntry = form.get('image');
    const file = (imageEntry instanceof File && imageEntry.size > 0) ? imageEntry : null;

    // Validation
    if (!name || !rating || !content) {
      return NextResponse.json(
        { success: false, error: 'דירוג, תוכן ושם הם שדות חובה' },
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
      if (isAllowedFileType(file.name)) {
        imageFilename = await uploadFile(file);
      } else {
        return NextResponse.json(
          { success: false, error: 'סוג הקובץ לא נתמך' },
          { status: 400 }
        );
      }
    }

    const result = await pool.query(
      'INSERT INTO reviews (name, rating, content, image_filename) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, rating, content, imageFilename]
    );

    revalidateTag('reviews', 'max');

    return NextResponse.json({
      success: true,
      review: result.rows[0],
      message: 'הביקורת נוספה בהצלחה'
    });
  } catch (error) {
    console.error('Add review error:', error);
    return NextResponse.json(
      { success: false, error: 'שגיאה בהוספת הביקורת' },
      { status: 500 }
    );
  }
}