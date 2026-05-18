import type { Metadata } from 'next';
import SubmitReviewForm from '@/components/SubmitReviewForm';

export const metadata: Metadata = {
  title: 'שתף חוות דעת',
  description: 'שתפו את חוות הדעת שלכם על המנופים והשירות שלנו',
};

export default function SubmitReviewPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-5">
      <div className="flex flex-col w-full max-w-[960px]">
        <SubmitReviewForm />
      </div>
    </div>
  );
}
