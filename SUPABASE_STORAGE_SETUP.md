# Supabase Storage Setup for Blog Images

To complete the image upload functionality, you need to create a storage bucket in your Supabase project:

## 1. Create Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to **Storage**
3. Click **Create new bucket**
4. Bucket name: `blog-assets`
5. Set bucket to **Public** (enable public access)
6. Click **Create bucket**

## 2. Create Folder
Inside the `blog-assets` bucket, create a folder named: `blog-images`

## 3. Set Storage Policies

Add these policies to allow authenticated users to upload images:

### Policy 1: Allow authenticated users to upload images
```sql
CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-assets' AND
  (storage.foldername(name))[1] = 'blog-images'
);
```

### Policy 2: Allow public read access
```sql
CREATE POLICY "Allow public read access to blog images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-assets');
```

### Policy 3: Allow users to delete their own images (optional)
```sql
CREATE POLICY "Allow users to delete their blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-assets' AND
  (storage.foldername(name))[1] = 'blog-images'
);
```

## 4. CORS Configuration
Add your domain to the CORS settings in Storage > Settings:

Allowed origins:
- `http://localhost:5173` (for development)
- Your production domain

Allowed methods: GET, HEAD, POST, PUT, DELETE

Allowed headers: *

## Implementation Details

✅ Features implemented:
- File upload with drag & drop style interface
- Image preview before upload
- Automatic unique filename generation
- Progress states during upload
- Error handling and toast notifications
- Option to remove uploaded image
- Fallback manual URL input
- Full backwards compatibility with existing images
- Image URL stored correctly in `image_url` column

The upload functionality uses Supabase Storage SDK, generates public URLs automatically, and stores them in the same database column that was previously used for manual URLs.