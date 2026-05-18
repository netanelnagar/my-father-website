import type { Metadata } from 'next';
import UploadGalleryForm from '@/components/UploadGalleryForm';

export const metadata: Metadata = {
  title: 'שתף תמונת פרויקט',
  description: 'שתפו תמונות של המנוף שלכם בפעולה להצגה בגלריה שלנו',
};

export default function UploadImagePage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-5">
      <div className="flex flex-col w-full max-w-[960px]">
        <UploadGalleryForm />
      </div>
    </div>
  );
}
