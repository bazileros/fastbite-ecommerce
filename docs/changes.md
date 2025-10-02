# Codebase Cleanup Plan

## Overview
This document outlines the removal of MinIO integration and mock data from the FastBite codebase, transitioning to Convex native storage.

## MinIO Removal

### Files to Delete
- `lib/minio.ts` - MinIO client and utility functions
- `app/actions/files.ts` - Server actions using MinIO
- `app/api/files/route.ts` - API route for file operations
- MinIO dependency from `package.json`

### Environment Variables to Remove
From `.env` and `.env.example`:
- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_USE_SSL`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_PUBLIC_URL`
- `MINIO_BUCKET_NAME`
- `MINIO_REGION`

### Documentation Updates
- `docs/setup.md` - Remove MinIO setup instructions
- `docs/security.md` - Remove MinIO security references
- `README.md` - Update storage references

## Mock Data Removal

### Files to Delete
- `data/seed-data.json` - Sample data file
- `convex/seed.ts` - Convex seeding functions
- `scripts/seed.ts` - Database seeding script

### Package.json Updates
Remove scripts:
- `db:seed`
- `convex:dev` (if duplicate)
- `convex:deploy` (if duplicate)

### Documentation Updates
- `docs/setup.md` - Remove seeding instructions
- `docs/convex.md` - Remove seed references
- `README.md` - Remove seed commands

## Schema Updates

## Schema Updates

### meals.image Field
Current: `image: v.union(v.id('_storage'), v.string())`
Should be: `image: v.id('_storage')` (only Convex storage IDs)

### categories.image Field
Current: `image: v.optional(v.union(v.id('_storage'), v.string()))`
Should be: `image: v.optional(v.id('_storage'))` (only Convex storage IDs)

### Seeding Mutations to Remove
- `createMealForSeeding` - Bypasses authentication for seeding
- `createCategoryForSeeding` - Bypasses authentication for seeding  
- `createOrderForSeeding` - Bypasses authentication for seeding

### Seeding Queries to Remove
- `getMealsForSeeding` - Bypasses authentication for seeding
- `getUsersForSeeding` - Bypasses authentication for seeding

### Convex Actions to Update
- `convex/actions.ts` - Replace uploadImage/deleteImage actions to use Convex storage directly instead of calling MinIO API

### Hooks to Update
- `hooks/use-advanced.ts` - Remove uploadImage/deleteImage from useMealManagement hook
- `hooks/use-server-actions.ts` - Remove useUploadImage/useDeleteImage hooks
- `lib/server-actions.ts` - Remove uploadImageAction function

### Components to Check
- Any components using uploadImage/deleteImage hooks need to be updated to use Convex storage directly

### API Routes to Remove
- `app/api/files/route.ts` - Uses MinIO server actions

### New Convex Storage Implementation Needed
- Implement direct Convex file storage upload/delete functions
- Update meal/category creation to use Convex storage IDs
- Update image URL generation to use Convex storage URLs

### Migration Steps
- Remove `/api/files` route entirely
- Update any references to file upload endpoints

## Migration Steps

1. **Backup current data** - Ensure all existing images are preserved
2. **Update schema** - Change image fields to only accept Convex storage IDs
3. **Remove MinIO code** - Delete all MinIO-related files
4. **Update file upload logic** - Implement Convex storage uploads
5. **Clean environment** - Remove MinIO environment variables
6. **Update documentation** - Remove MinIO and seeding references
7. **Test file uploads** - Verify Convex storage integration works

## Dead Code Identification

### Potentially Unused Files
- `convex/seed.ts` - Seeding functions (to be removed)
- `scripts/seed.ts` - Seeding script (to be removed)
- `data/seed-data.json` - Mock data (to be removed)

### Functions to Review
- Any MinIO utility functions in other files
- File upload related code in components
- Image URL generation functions

### Dependencies to Remove
- `minio` package
- Any MinIO-related dev dependencies

## Summary of Changes Required

### Files to Delete (High Priority)
1. **MinIO Files:**
   - `lib/minio.ts`
   - `app/actions/files.ts`
   - `app/api/files/route.ts`

2. **Mock Data Files:**
   - `data/seed-data.json`
   - `convex/seed.ts`
   - `scripts/seed.ts`

### Schema Changes (High Priority)
- Update `meals.image` and `categories.image` fields to only accept Convex storage IDs

### Code Updates (Medium Priority)
- Remove seeding mutations/queries/actions from Convex
- Update Convex actions to use Convex storage directly
- Remove MinIO hooks and server actions
- Clean up environment variables and package.json

### Documentation Updates (Low Priority)
- Remove MinIO and seeding references from docs
- Update setup instructions

### New Implementation Needed (High Priority)
- Implement Convex storage upload/delete functions
- Update components to use new storage system

## Dead Code Identified

### Completely Unused (Safe to Delete)
- All MinIO-related files and functions
- All seeding-related files and functions
- PAYSTACK_WEBHOOK_SECRET environment variable

### Partially Used (Need Updates)
- File upload hooks and actions (need to be rewritten for Convex storage)
- Image URL generation (needs to use Convex URLs)
- Schema image fields (need to restrict to Convex storage IDs)

### Still Used (Keep)
- Paystack payment processing (already moved to Next.js)
- Clerk webhook handling (working correctly)
- Audit logging (working correctly)</content>
<parameter name="filePath">/home/zalisile/projects/bolt-nextjs/changes.md