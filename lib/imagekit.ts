export interface UploadImageOptions {
  folder?: string;
  tags?: string;
  signal?: AbortSignal;
}

interface UploadImageResponse {
  success?: boolean;
  url?: string;
  fileId?: string;
  name?: string;
  error?: string;
}

/**
 * Uploads an image file to the ImageKit upload API route and returns the hosted URL.
 */
export async function uploadImageToImageKit(
  file: File,
  options: UploadImageOptions = {}
): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const formData = new FormData();
  formData.append('file', file);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags) {
    formData.append('tags', options.tags);
  }

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
    signal: options.signal,
  });

  if (!response.ok) {
    let message = 'Image upload failed';

    try {
      const errorData = (await response.json()) as UploadImageResponse;
      if (errorData?.error) {
        message = errorData.error;
      }
    } catch (_error) {
      // Ignore JSON parsing errors and fall back to default message
    }

    throw new Error(message);
  }

  const data = (await response.json()) as UploadImageResponse;

  if (!data?.url) {
    throw new Error('Image upload response did not include a URL');
  }

  return data.url;
}
