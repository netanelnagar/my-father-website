'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
import { fetchGallerySubmissions, GallerySubmissionsResult } from '@/lib/queries/gallerySubmissions';

const statusLabel: Record<string, string> = {
  pending: 'ממתין',
  approved: 'אושר',
  rejected: 'נדחה',
};

const statusClass: Record<string, string> = {
  pending: 'bg-[#fef9c3] text-[#854d0e]',
  approved: 'bg-[#dcfce7] text-[#166534]',
  rejected: 'bg-[#fee2e2] text-[#991b1b]',
};

export function PendingGalleryTable() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<GallerySubmissionsResult>({
    queryKey: ['gallery-submissions'],
    queryFn: fetchGallerySubmissions,
    staleTime: 0,
  });

  const submissions = data?.submissions ?? [];

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const res = await fetch(`/api/admin/gallery-submissions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error ?? 'Failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/gallery-submissions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error ?? 'Failed');
    },
  });

  const handleUpdate = (id: string, status: 'approved' | 'rejected') => {
    const label = status === 'approved' ? 'אושר' : 'נדחה';
    const loadingId = toast.loading(`מעדכן סטטוס…`);
    updateMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['gallery-submissions'] });
          toast.success(`ההגשה ${label} בהצלחה`, { id: loadingId });
        },
        onError: (e) => {
          toast.error(`שגיאה: ${e instanceof Error ? e.message : 'לא ידועה'}`, { id: loadingId });
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    toast('האם אתה בטוח שברצונך למחוק הגשה זו?', {
      action: {
        label: 'מחק',
        onClick: () => {
          const loadingId = toast.loading('מוחק…');
          deleteMutation.mutate(id, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ['gallery-submissions'] });
              toast.success('ההגשה נמחקה', { id: loadingId });
            },
            onError: (e) => {
              toast.error(`שגיאה: ${e instanceof Error ? e.message : 'לא ידועה'}`, { id: loadingId });
            },
          });
        },
      },
      cancel: { label: 'ביטול', onClick: () => toast.dismiss() },
    });
  };

  return (
    <section className="w-full">
      <h2 className="text-[#111618] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 sm:px-6 pb-3 pt-5">
        הגשות תמונות מהציבור
      </h2>
      <div className="px-4 sm:px-6 py-3">
        <div className="flex overflow-x-auto rounded-lg border border-[#dbe2e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                {['כותרת', 'תמונה', 'תאריך', 'סטטוס', 'פעולות'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-right text-[#111618] text-sm font-medium leading-normal ${i <= 1 ? 'w-[300px]' : 'w-48'}`}
                  >
                    {h}
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
                      <span className="text-sm text-[#617c89]">טוען הגשות…</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr className="border-t border-t-[#dbe2e6]">
                  <td colSpan={5} className="px-4 py-6 text-sm text-[#617c89] text-center">
                    שגיאה בטעינת ההגשות.
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr className="border-t border-t-[#dbe2e6]">
                  <td colSpan={5} className="px-4 py-6 text-sm text-[#617c89] text-center">
                    אין הגשות להצגה.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.id} className="border-t border-t-[#dbe2e6]">
                    <td className="h-[72px] w-[300px] px-4 py-2 text-sm font-normal leading-normal text-[#111618]">
                      {s.caption}
                    </td>
                    <td className="h-[72px] w-[300px] px-4 py-2">
                      <img
                        src={`/submissions/${s.filename}`}
                        alt={s.caption}
                        className="h-12 w-20 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2 text-sm text-[#617c89]">
                      {new Date(s.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusClass[s.status] ?? ''}`}>
                        {statusLabel[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="h-[72px] w-48 px-4 py-2 text-sm font-bold leading-normal text-[#617c89]">
                      <div className="flex flex-wrap gap-2">
                        {s.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdate(s.id, 'approved')}
                              className="text-green-700 hover:underline"
                            >
                              אשר
                            </button>
                            <button
                              onClick={() => handleUpdate(s.id, 'rejected')}
                              className="text-red-600 hover:underline"
                            >
                              דחה
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
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
