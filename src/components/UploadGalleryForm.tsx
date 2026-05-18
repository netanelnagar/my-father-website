'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FiUpload, FiImage, FiCheckCircle } from 'react-icons/fi';
import { GallerySubmissionForm } from '@/types';

export default function UploadGalleryForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GallerySubmissionForm>({ mode: 'onTouched' });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data: GallerySubmissionForm) => {
    try {
      const formData = new FormData();
      formData.append('caption', data.caption);
      formData.append('image', data.image[0]);

      const res = await fetch('/api/gallery-submissions', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.error || 'Failed');

      setSubmitted(true);
      toast.success('התמונה נשלחה בהצלחה!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'שגיאה בשליחת התמונה';
      toast.error(msg);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center max-w-[480px] mx-auto px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e6f6ff]">
          <FiCheckCircle className="w-8 h-8 text-[#13a4ec]" aria-hidden="true" />
        </div>
        <p className="text-[#111618] text-2xl font-bold">תודה על שיתוף התמונה!</p>
        <p className="text-[#617c89] text-base leading-relaxed">
          התמונה שלך התקבלה בהצלחה ותתווסף לגלריה לאחר אישור צוות האתר.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col max-w-[512px] py-5 flex-1"
    >
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111618] tracking-light text-[32px] font-bold leading-tight min-w-72">
          שתפו תמונת פרויקט
        </p>
      </div>
      <p className="text-[#617c89] text-base leading-normal px-4 pb-2">
        יש לכם תמונה של המנוף שלכם בפעולה? שתפו אותה איתנו ותוכלו להופיע בגלריה שלנו.
      </p>

      <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111618] text-base font-medium leading-normal pb-2">כותרת / תיאור</p>
          <input
            placeholder="תארו את התמונה בקצרה"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111618] focus:outline-0 focus:ring-0 border border-[#dbe2e6] bg-white focus:border-[#dbe2e6] h-14 placeholder:text-[#617c89] p-[15px] text-base font-normal leading-normal"
            {...register('caption', {
              required: 'כותרת היא שדה חובה',
              maxLength: { value: 255, message: 'הכותרת ארוכה מדי' },
            })}
          />
          {errors.caption && <p className="text-red-600 text-sm mt-1">{errors.caption.message}</p>}
        </label>
      </div>

      <div className="flex max-w-[480px] flex-col gap-2 px-4 py-3">
        <p className="text-[#111618] text-base font-medium leading-normal">בחירת תמונה</p>
        <label className="inline-flex items-center gap-2 w-fit cursor-pointer rounded-lg bg-[#f0f3f4] h-11 px-4 text-[#111618] text-sm font-bold leading-normal tracking-[0.015em]">
          <FiUpload className="w-4 h-4" aria-hidden="true" />
          בחר קובץ
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            {...register('image', { required: 'יש לבחור תמונה' })}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setSelectedFile(file);
              setValue('image', e.target.files as FileList);
            }}
          />
        </label>
        {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image.message as string}</p>}

        {selectedFile && (
          <div className="flex items-center gap-2 rounded-lg border border-[#dbe2e6] bg-[#f8fbfc] px-3 py-2 w-fit">
            <FiImage className="w-4 h-4 text-[#13a4ec]" aria-hidden="true" />
            <span className="text-sm text-[#111618] max-w-[200px] truncate" title={selectedFile.name}>
              {selectedFile.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex px-4 py-6 justify-start">
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#13a4ec] text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-60"
        >
          <span className="truncate">{isSubmitting ? 'שולח…' : 'שליחת תמונה'}</span>
        </button>
      </div>
    </form>
  );
}
