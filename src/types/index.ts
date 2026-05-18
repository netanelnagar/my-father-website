export interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  image_filename?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type ReviewForm = {
  name: string;
  rating: number;
  content: string;
  image: FileList | null;
};

export interface GallerySubmission {
  id: string;
  caption: string;
  filename: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export type GallerySubmissionForm = {
  caption: string;
  image: FileList;
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface CraneData {
  id: string;
  name: string;
  title: string;
  description: string;
  features: string[];
  specifications: {
    [key: string]: string;
  };
  imagePlaceholder: string;
}

export interface AdminAuth {
  email: string;
  isAdmin: boolean;
}

export type AdminTabKey = 'reviews' | 'gallery' | 'customer-reviews' | 'upload-review' | 'pending-gallery';

export interface GalleryImage {
  name: 'primary' | 'side' | 'cabin';
  classes: string;
  src: string;
  alt: string;
}
