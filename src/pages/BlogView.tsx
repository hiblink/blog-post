import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Heart, Pencil } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BlogWithCategory = Tables<"blogs">;

const BlogView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogWithCategory | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      const { data } = await supabase.from("blogs").select("*").eq("id", id).single();
      setBlog((data as BlogWithCategory) ?? null);
    };

    void fetchBlog();
  }, [id]);

  const handleLike = async () => {
    if (!id || !blog || likeLoading) return;
    
    setLikeLoading(true);
    const currentRating = Number(blog.rating) || 0;
    const newRating = currentRating + 1;

    const { error } = await supabase
      .from("blogs")
      .update({ rating: newRating.toString() })
      .eq("id", id);

    if (!error) {
      setBlog({ ...blog, rating: newRating.toString() });
    }
    
    setLikeLoading(false);
  };

  if (!blog) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-muted-foreground">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/blogs")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Button>
          <Button variant="outline" onClick={() => navigate(`/blogs/${id}/edit`)} className="gap-2">
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        </div>

        <Card>
          {blog.image_url ? (
            <div className="h-64 w-full overflow-hidden rounded-t-lg">
              <img src={blog.image_url} alt={blog.title} className="h-full w-full object-cover" />
            </div>
          ) : null}
<CardHeader>
  <div className="mb-2 flex items-center gap-3 text-sm text-muted-foreground">
    <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
      {blog.category ?? "Uncategorized"}
    </span>
    <span className="flex items-center gap-1">
      <Calendar className="h-3.5 w-3.5" />
      {new Date(blog.created_at).toLocaleDateString()}
    </span>
  </div>
  <CardTitle className="text-3xl">{blog.title}</CardTitle>
</CardHeader>
  <CardContent>
    <div className="max-w-none prose prose-sm text-foreground" dangerouslySetInnerHTML={{ __html: blog.description ?? '' }} />
    
    <div className="mt-6 pt-6 border-t flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={likeLoading}
        className="gap-2 text-muted-foreground hover:text-red-500 hover:bg-red-50"
      >
        <Heart className="h-4 w-4" />
        <span>{Number(blog.rating) || 0} Likes</span>
      </Button>
    </div>
  </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogView;
