import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { UploadResult } from './s3';

export async function uploadFileLocally(
  file: Buffer,
  key: string,
  _contentType: string
): Promise<UploadResult> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  
  // Write file to public/uploads
  const filePath = join(uploadsDir, key.replace(/\//g, '_'));
  await writeFile(filePath, file);
  
  // Return public URL
  const url = `/uploads/${key.replace(/\//g, '_')}`;
  
  return {
    key,
    url,
  };
}

export function isS3Configured(): boolean {
  return !!(
    process.env.TIGRIS_ACCESS_KEY_ID &&
    process.env.TIGRIS_SECRET_ACCESS_KEY &&
    process.env.TIGRIS_BUCKET_NAME
  );
}