import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * API Route for uploading images to ImageKit
 * 
 * This endpoint handles image uploads from the admin panel and returns the ImageKit URL.
 * Images are uploaded directly to ImageKit's cloud storage.
 * 
 * @see https://docs.imagekit.io/api-reference/upload-file-api/server-side-file-upload
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const requestedFolder = formData.get('folder');
    const requestedTags = formData.get('tags');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate environment variables
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('ImageKit configuration missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Create authentication header - ImageKit uses privateKey:empty format
    const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;

    // Prepare form data for ImageKit API
    const imagekitFormData = new FormData();
    let folder = typeof requestedFolder === 'string' && requestedFolder.trim() !== ''
      ? requestedFolder.trim()
      : '/admin';

    if (!folder.startsWith('/')) {
      folder = `/${folder}`;
    }

    const tags = typeof requestedTags === 'string' && requestedTags.trim() !== ''
      ? requestedTags.trim()
      : 'admin-upload';

    imagekitFormData.append('file', base64File);
    imagekitFormData.append('fileName', file.name);
    imagekitFormData.append('folder', folder);
    imagekitFormData.append('useUniqueFileName', 'true');
    imagekitFormData.append('tags', tags);

    // Upload to ImageKit
    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
      },
      body: imagekitFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      console.error('ImageKit upload failed:', errorData);
      return NextResponse.json(
        { error: 'Upload failed', details: errorData },
        { status: uploadResponse.status }
      );
    }

    const result = await uploadResponse.json();

    // Return the ImageKit URL
    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
