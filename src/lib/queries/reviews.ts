import { Review } from '@/types';

export type FetchReviewsResult = {
  status: 'success' | 'error';
  reviews?: Review[];
};

const baseUrl = process.env.__NEXT_PRIVATE_ORIGIN ?? '';

export async function fetchReviews(): Promise<FetchReviewsResult> {

  if (typeof window === 'undefined') {
    try {
      const { pool } = await import('@/lib/db');
      const result = await pool.query(
        "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC"
      );

      return {
        status: 'success',
        reviews: result.rows || [],
      };
    } catch (error) {
      console.error('Database fetch error:', error);
      return { status: 'error', reviews: [] };
    }
  }
  const response = await fetch(`${baseUrl}/api/reviews`, {
    next: { tags: ['reviews'] }, headers: { 'origin': baseUrl }
  });

  if (!response.ok) {
    return {
      status: 'error',
      reviews: [],
    };
  }

  const data = await response.json();
  return {
    status: 'success',
    reviews: Array.isArray(data?.reviews) ? data.reviews : [],
  };
}

export async function fetchReviewsExistence(): Promise<boolean> {
  const response = await fetch(`${baseUrl}/api/reviews/exists`, { next: { tags: ['reviews-exists'] } });
  if (!response.ok) {
    throw new Error(`Failed to check review availability: ${response.status}`);
  }

  const data = await response.json();
  return Boolean(data?.hasReviews);
}