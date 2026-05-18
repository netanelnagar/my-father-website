'use client';

import { SetStateAction, useEffect, Dispatch } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { Review } from '@/types';

const tablesHeaders = ['שם', 'ביקורת', 'דירוג', 'סטטוס', 'פעולות'];

const statusLabel: Record<string, string> = {
  pending: 'ממתין',
  approved: 'מאושר',
  rejected: 'נדחה',
};

const statusClass: Record<string, string> = {
  pending: 'bg-[#fef9c3] text-[#854d0e]',
  approved: 'bg-[#dcfce7] text-[#166534]',
  rejected: 'bg-[#fee2e2] text-[#991b1b]',
};

type ReviewsTableProps = {
  flagForAddedOrDeletedReview?: boolean;
  setFlagForAddedOrDeletedReview: Dispatch<SetStateAction<boolean>>;
};

export function ReviewsTable({ flagForAddedOrDeletedReview, setFlagForAddedOrDeletedReview }: ReviewsTableProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<{ reviews: Review[] }>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const res = await fetch('/api/admin/reviews', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error ?? 'Failed');
      return { reviews: json.reviews ?? [] };
    },
    staleTime: 0,
  });

  const reviews = data?.reviews ?? [];

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data?.error ?? 'Failed to delete review');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error ?? 'Failed');
    },
  });

  const handleDeleteReview = (reviewId: string, name: string) => {
    toast(`האם אתה בטוח שברצונך למחוק את הביקורת של ${name}?`, {
      action: {
        label: 'מחק',
        onClick: () => {
          const loadingToastId = toast.loading(`מוחק ביקורת, ${name}…`);
          deleteReviewMutation.mutate(reviewId, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
              toast.success('הביקורת נמחקה', { id: loadingToastId });
              setFlagForAddedOrDeletedReview((prev) => !prev);
            },
            onError: (error) => {
              toast.error(
                `שגיאה במחיקה: ${error instanceof Error ? error.message : 'לא ידועה'}`,
                { id: loadingToastId },
              );
            },
          });
        },
      },
      cancel: { label: 'ביטול', onClick: () => toast.dismiss() },
    });
  };

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'אושרה' : 'נדחתה';
    const loadingId = toast.loading('מעדכן…');
    updateStatusMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
          toast.success(`הביקורת ${label} בהצלחה`, { id: loadingId });
          setFlagForAddedOrDeletedReview((prev) => !prev);
        },
        onError: (e) => {
          toast.error(`שגיאה: ${e instanceof Error ? e.message : 'לא ידועה'}`, { id: loadingId });
        },
      }
    );
  };

  useEffect(() => {
    if (flagForAddedOrDeletedReview !== undefined) {
      refetch();
    }
  }, [flagForAddedOrDeletedReview, refetch]);

  return (
    <section className="w-full">
      <h2 className="text-[#111618] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-3 pt-5">
        כל הביקורות
      </h2>
      <div className="px-4 sm:px-6 py-3">
        <div className="flex overflow-x-auto rounded-lg border border-[#dbe2e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                {tablesHeaders.map((header, index) => (
                  <th
                    key={header}
                    className={
                      'px-4 py-3 text-right text-[#111618] text-sm font-medium leading-normal' +
                      (index <= 1 ? ' w-[360px]' : ' w-48')
                    }
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-t border-t-[#dbe2e6]">
                  <td colSpan={5} className="px-4 py-6">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FiLoader className="h-5 w-5 animate-spin text-[#13a4ec]" />
                      <span className="text-sm text-[#617c89]">טוען ביקורות…</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="border-t border-t-[#dbe2e6]">
                  <td colSpan={5} className="px-4 py-6 text-sm text-[#617c89] text-center">
                    שגיאה בטעינת הביקורות.
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr className="border-t border-t-[#dbe2e6]">
                  <td colSpan={5} className="px-4 py-6 text-sm text-[#617c89] text-center">
                    אין ביקורות להצגה.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-t border-t-[#dbe2e6]">
                    <td className="h-[72px] w-[360px] px-4 py-2 text-sm font-normal leading-normal text-[#111618]">
                      {review.name || 'Anonymous'}
                    </td>
                    <td className="h-[72px] w-[360px] px-4 py-2 text-sm font-normal leading-normal text-[#617c89]">
                      {review.content}
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2 text-sm font-normal leading-normal">
                      <button className="flex h-8 w-full min-w-[84px] max-w-[480px] items-center justify-center rounded-lg bg-[#f0f3f4] px-4 text-sm font-medium leading-normal text-[#111618]">
                        <span className="truncate">{review.rating} כוכבים</span>
                      </button>
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass[review.status] ?? ''}`}>
                        {statusLabel[review.status] ?? review.status}
                      </span>
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2 text-sm font-bold leading-normal tracking-[0.015em]">
                      <div className="flex flex-wrap gap-2">
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(review.id, 'approved')}
                              className="text-green-700 hover:underline"
                            >
                              אשר
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(review.id, 'rejected')}
                              className="text-red-600 hover:underline"
                            >
                              דחה
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id, review.name)}
                          className="text-[#111618] hover:underline"
                        >
                          מחק
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
