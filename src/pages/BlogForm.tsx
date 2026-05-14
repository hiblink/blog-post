import { useEffect, useState, ChangeEvent } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Upload, X } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";


const BlogForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [tag, setTag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Convert title to a URL-friendly slug
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-")      // Replace spaces with hyphens
      .replace(/-+/g, "-")       // Collapse multiple hyphens
      .replace(/^-+|-+$/g, "");  // Trim leading/trailing hyphens
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(generateSlug(value));
  };


  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchBlog = async () => {
      const { data, error } = await supabase.from("blogs").select("*").eq("id", id).single();
      if (error || !data) return;

    setTitle(data.title);
    setSlug(data.slug ?? "");
    setSlugManuallyEdited(true);
    setDescription(data.description ?? "");
    setCategory(data.category ?? "Uncategorized");
    setTag(data.tag ?? "");
    setImageUrl(data.image_url ?? "");
    setPrice(data.price ?? "");
    setRating(data.rating ?? "");
    };

    void fetchBlog();
  }, [id, isEdit]);

  // React Quill editor configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'blockquote', 'code-block'],
      ['table'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'blockquote', 'code-block',
    'table'
  ];

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setUploading(true);

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('blog-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-assets')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast({ title: "Upload successful", description: "Image has been uploaded." });

    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: error instanceof Error ? error.message : "Failed to upload image", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setImagePreview(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //if (!user) return;

    setLoading(true);

const blogData = {
  title,
  description,
  category,
  tag,
  image_url: imageUrl || null,
  price,
  rating,
  slug: slug || null,
};

try {
  console.log('📤 Sending blog data:', blogData);
  console.log('📊 Blog data keys:', Object.keys(blogData));
  
  if (isEdit && id) {
    console.log('🔄 Updating blog with ID:', id);
    const { error, data } = await supabase.from("blogs").update(blogData).eq("id", id).select();
    console.log('✅ Update response:', { data, error });
    if (error) throw error;
    toast({ title: "Updated", description: "Blog updated successfully." });
    navigate("/blogs");
  } else {
    console.log('➕ Creating new blog');
    const { error, data } = await supabase.from("blogs").insert(blogData).select();
    console.log('✅ Insert response:', { data, error });
    if (error) throw error;
    toast({ title: "Created", description: "Blog created successfully." });
    // Navigate to the blog's slug URL if available
    const createdBlog = data?.[0];
    if (createdBlog?.slug) {
      navigate(`/blogs/${createdBlog.slug}`);
    } else if (createdBlog?.id) {
      navigate(`/blogs/${createdBlog.id}`);
    } else {
      navigate("/blogs");
    }
  }
    } catch (error) {
      console.error('❌ Blog operation failed:', error);
      console.error('❌ Error details:', {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Edit Blog" : "Create New Blog"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input value={title} onChange={(event) => handleTitleChange(event.target.value)} placeholder="Blog title" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Slug (URL)</label>
                <div className="flex gap-2">
                  <Input 
                    value={slug} 
                    onChange={(event) => handleSlugChange(event.target.value)} 
                    placeholder="blog-url-slug"
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSlugManuallyEdited(false);
                      setSlug(generateSlug(title));
                    }}
                    title="Regenerate slug from title"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">URL: /blogs/{slug || "your-slug"}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Blog Image</label>
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                        <span className="text-sm">Uploading...</span>
                      </div>
                    )}
                  </div>
                ) : imageUrl ? (
                  <div className="relative">
                    <img 
                      src={imageUrl} 
                      alt="Current image" 
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">Upload an image for your blog</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
                
                {uploading && (
                  <p className="text-sm text-muted-foreground text-center">Uploading image...</p>
                )}
                
                {/* Optional direct URL input */}
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Or paste image URL:</p>
                  <Input
                    value={imageUrl}
                    onChange={(event) => {
                      setImageUrl(event.target.value);
                      setImagePreview(null);
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <ReactQuill
                  theme="snow"
                  value={description}
                  onChange={setDescription}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your blog description..."
                  className="bg-background min-h-[300px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tag</label>
                <Input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Blog tag" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price</label>
                  <Input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Price" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rating</label>
                  <Input value={rating} onChange={(event) => setRating(event.target.value)} placeholder="Rating" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : isEdit ? "Update Blog" : "Create Blog"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/blogs")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogForm;
