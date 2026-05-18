import path from 'path';
import { writeFile, mkdir, rename } from 'fs/promises';

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico'];
const videoExtensions = ['.mp4', '.mov', '.webm', '.mkv', '.quicktime'];
export const uploadsDir = path.join(process.cwd(), 'public');
export const pendingUploadsDir = path.join(process.cwd(), 'public', 'submissions');


export async function uploadFile(file: File): Promise<string | null> {

    try {

        const filename = file.name;
        const filepath = path.join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        return file.name;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
}

export async function uploadPendingFile(file: File): Promise<string | null> {
    try {
        await mkdir(pendingUploadsDir, { recursive: true });
        const filename = `${Date.now()}_${file.name}`;
        const filepath = path.join(pendingUploadsDir, filename);
        const bytes = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(bytes));
        return filename;
    } catch (error) {
        console.error('Error uploading pending file:', error);
        return null;
    }
}

export async function movePendingFileToPublic(filename: string): Promise<boolean> {
    try {
        const src = path.join(pendingUploadsDir, filename);
        const dest = path.join(uploadsDir, filename);
        await rename(src, dest);
        return true;
    } catch (error) {
        console.error('Error moving pending file to public:', error);
        return false;
    }
}

export function isAllowedFileType(name: string) {
    const ext = path.extname(name).toLowerCase();
    const allowedExtensions = [...imageExtensions, ...videoExtensions];
    return allowedExtensions.includes(ext);
}

export function isImage(name: string) {
    const ext = path.extname(name).toLowerCase();
    return imageExtensions.includes(ext);
}

export function isVideo(name: string) {
    const ext = path.extname(name).toLowerCase();
    return videoExtensions.includes(ext);
}
