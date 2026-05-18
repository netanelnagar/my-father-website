import { GallerySubmission } from '@/types';

export type GallerySubmissionsResult = {
  submissions: GallerySubmission[];
};

export async function fetchGallerySubmissions(): Promise<GallerySubmissionsResult> {
  const res = await fetch('/api/admin/gallery-submissions', {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch gallery submissions: ${res.status}`);
  }

  const data = await res.json();

  if (!data?.success) {
    throw new Error(data?.error ?? 'Gallery submissions fetch failed');
  }

  return {
    submissions: Array.isArray(data.submissions) ? data.submissions : [],
  };
}
