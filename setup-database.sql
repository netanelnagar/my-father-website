-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE ramon_cranes;

-- Connect to the database and run the following:

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    image_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Insert sample data (optional - for testing)
INSERT INTO reviews (rating, content, image_filename) VALUES 
(5, 'שירות מעולה! המנוף שהתקנו עובד בצורה מושלמת וללא בעיות. הצוות היה מקצועי ואמין.', NULL),
(5, 'איכות יוצאת דופן. קיבלנו מנוף תקרה שעונה על כל הדרישות שלנו ועוד יותר. ממליץ בחום!', NULL),
(4, 'מנוף פנאומטי איכותי עם שירות טוב. הייתה התעכבות קטנה בהתקנה אבל התוצאה מצויינת.', NULL)
ON CONFLICT DO NOTHING;

-- Migration: add name and status columns to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'approved';

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Gallery submissions from public users (pending admin approval)
CREATE TABLE IF NOT EXISTS gallery_submissions (
    id SERIAL PRIMARY KEY,
    caption VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_submissions_status ON gallery_submissions(status);