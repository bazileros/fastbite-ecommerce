# ImageKit Integration Guide

This document describes how image management is implemented in the FastBite application using ImageKit.

## Overview

FastBite uses ImageKit (https://imagekit.io) as the primary image CDN and storage solution. All meal images, category images, and other assets are stored on ImageKit, and their URLs are saved as strings in the Convex database.

## Architecture

### Image Storage Flow

```
Admin uploads image → FormData sent to /api/upload-image 
→ API route uploads to ImageKit → ImageKit URL returned
→ URL saved in Convex database
```

### Image Display Flow

```
Component queries Convex → Gets meal with imageURL string
→ Next.js Image component renders with ImageKit URL
```

## Environment Variables

The following environment variables must be configured:

```bash
# Public key (used on client-side)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key

# Private key (server-side only, NEVER expose to client)
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

# URL endpoint for your ImageKit account
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

## Upload API Endpoint

**Location:** `app/api/upload-image/route.ts`

This endpoint handles image uploads from the admin panel.

### Request

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Body:** FormData with a `file` field

### Response

Success (200):
```json
{
  "success": true,
  "url": "https://ik.imagekit.io/your_id/meals/filename.jpg",
  "fileId": "imagekit_file_id",
  "name": "filename.jpg"
}
```

Error (400/500):
```json
{
  "error": "Error description",
  "details": {}
}
```

### Features

- Validates file presence
- Checks environment variables
- Converts file to base64 for ImageKit API
- Organizes images in `/meals` folder
- Uses unique filenames automatically
- Tags images with `meal` and `admin-upload`
- Comprehensive error handling
- Detailed error logging

## Database Schema

Images are stored as optional string URLs in the database:

```typescript
// convex/schema.ts
meals: defineTable({
  // ... other fields
  image: v.optional(v.string()), // ImageKit URL
  // ... other fields
})
```

## Admin Implementation

**Location:** `app/(admin)/admin/menu/page.tsx`

### Upload Process

1. User selects an image file
2. Preview is generated (base64 data URL)
3. On form submission:
   - FormData is created with the file
   - POST request to `/api/upload-image`
   - Response contains ImageKit URL
   - URL is passed to Convex mutation
   - URL is saved in database

### Code Example

```typescript
// Upload image
const uploadFormData = new FormData();
uploadFormData.append('file', formData.image);

const uploadResponse = await fetch('/api/upload-image', {
  method: 'POST',
  body: uploadFormData,
});

const uploadResult = await uploadResponse.json();
const imageUrl = uploadResult.url; // Use this URL

// Save to database
await createMeal({
  // ... other fields
  image: imageUrl,
});
```

### Image Display

All images use Next.js `Image` component with proper configuration:

```tsx
<div className="relative border rounded-md w-32 h-32">
  <Image
    src={meal.image || ''}
    alt={meal.name}
    fill
    className="object-cover rounded-md"
  />
</div>
```

For preview images (base64):
```tsx
<Image
  src={imagePreview}
  alt="Preview"
  fill
  className="object-cover rounded-md"
  unoptimized // Required for base64 data URLs
/>
```

## Error Handling

### Upload Errors

The admin panel handles upload errors gracefully:

1. **Network errors** - Shows toast notification, continues without image
2. **Validation errors** - Returns 400 with error details
3. **Server errors** - Returns 500 with error message
4. **ImageKit API errors** - Logged and returned to client

### Display Errors

If an image fails to load, fallback UI is shown:

```tsx
{getMealImageUrl(meal) ? (
  <Image src={getMealImageUrl(meal) || ''} ... />
) : (
  <div className="flex justify-center items-center bg-muted border rounded-md w-16 h-16">
    <span className="text-muted-foreground text-xs">No image</span>
  </div>
)}
```

## Best Practices

### Security

1. **Never expose private key** - Only use in server-side API routes
2. **Validate file types** - Accept only image/* MIME types
3. **Size limits** - Consider implementing max file size checks
4. **Rate limiting** - Protect upload endpoint from abuse

### Performance

1. **Use Next.js Image component** - Automatic optimization and lazy loading
2. **Base64 previews** - Show instant feedback before upload
3. **Proper aspect ratios** - Use `fill` with container dimensions
4. **Unoptimized for base64** - Add `unoptimized` prop for data URLs

### User Experience

1. **Loading states** - Show upload progress with toast notifications
2. **Error messages** - Provide clear, actionable error messages
3. **Image previews** - Let users see image before submitting
4. **Fallback UI** - Always show something when image is missing

## Future Enhancements

Potential improvements to consider:

1. **Image Transformations** - Use ImageKit's transformation API for resizing
2. **Upload Progress** - Show percentage progress during upload
3. **Multiple Images** - Support multiple image uploads per meal
4. **Image Gallery** - Browse and reuse previously uploaded images
5. **Bulk Upload** - Upload multiple images at once
6. **Image Compression** - Compress before upload to reduce bandwidth
7. **Crop Tool** - Allow admins to crop images before upload
8. **Alt Text** - Store and manage alt text for accessibility

## Troubleshooting

### Upload fails with 500 error

Check environment variables are set correctly:
```bash
echo $IMAGEKIT_PRIVATE_KEY
echo $NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY
echo $NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
```

### Images not displaying

1. Check URL format in database (should be full ImageKit URL)
2. Verify ImageKit account is active
3. Check browser console for CORS errors
4. Ensure URL endpoint matches your ImageKit account

### TypeScript errors

Make sure types are correct:
- Database: `image: v.optional(v.string())`
- Mutations: `image: v.optional(v.string())`
- Components: `meal.image: string | undefined`

## Migration Notes

### From Convex Storage

If migrating from Convex storage:

1. Remove all `Id<"_storage">` references
2. Change image field type to `v.optional(v.string())`
3. Update mutations to accept string URLs
4. Remove `getImageUrl` and `getImageUrls` queries
5. Update components to use URL directly
6. Remove storage-based upload/delete actions

### Existing Images

For existing meals with no images:

1. Images are optional (`v.optional`)
2. Components handle `undefined` gracefully
3. Fallback UI is shown when image is missing
4. Admins can update meals to add images

## Related Files

- API Route: `app/api/upload-image/route.ts`
- Admin UI: `app/(admin)/admin/menu/page.tsx`
- Schema: `convex/schema.ts`
- Mutations: `convex/mutations.ts`
- Environment: `.env.example`
- This Documentation: `docs/imagekit-integration.md`
