'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TabsNav } from '@/components/TabsNav';
import { ReviewsTable } from '@/components/ReviewsTable';
import { ProjectImages } from '@/components/ProjectImages';
import { PendingGalleryTable } from '@/components/PendingGalleryTable';
import { AdminTabKey } from '@/types';
import UploadReview from '@/components/UploadReview';


export default function AdminDashboard() {

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTabKey>('reviews');
  const [flagForAddedOrDeletedReview, setFlagForAddedOrDeletedReview] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          credentials: 'include'
        });

        if (response.ok) {
          setAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  });


  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <p className="loader text-[#13a4ec]"></p>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect to login
  }

  return (
    <>
      <TabsNav activeTab={activeTab} onChange={setActiveTab} />

      <div className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-full max-w-[960px]">
          <div className={activeTab === 'reviews' ? 'block' : 'hidden'}>
            <ReviewsTable flagForAddedOrDeletedReview={flagForAddedOrDeletedReview} setFlagForAddedOrDeletedReview={setFlagForAddedOrDeletedReview} />
          </div>

          <div className={activeTab === 'gallery' ? 'block' : 'hidden'}>
            <ProjectImages flagForAddedOrDeletedReview={flagForAddedOrDeletedReview} />
          </div>

          <div className={activeTab === 'upload-review' ? 'block' : 'hidden'}>
            <UploadReview setFlagForAddedOrDeletedReview={setFlagForAddedOrDeletedReview} />
          </div>

          <div className={activeTab === 'pending-gallery' ? 'block' : 'hidden'}>
            <PendingGalleryTable />
          </div>
        </div>
      </div>
    </>
  );
}