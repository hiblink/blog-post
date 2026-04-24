import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type BlogWithCategory = Tables<"blogs">;

const BlogList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogWithCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let query = supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterCategory !== "all") {
      query = query.eq("category", filterCategory);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setBlogs([]);
    } else {
      setBlogs((data as BlogWithCategory[]) ?? []);
    }

    setLoading(false);
  };


  useEffect(() => {
    void fetchBlogs();
  }, [user, filterCategory]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Deleted", description: "Blog deleted successfully." });
    void fetchBlogs();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Blog List</h1>
          <Button onClick={() => navigate("/blogs/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Blog
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by category:</span>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              <SelectItem value="Travel">Travel</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Health">Health</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
<TableHeader>
  <TableRow>
    <TableHead>Title</TableHead>
    <TableHead>Category</TableHead>
    <TableHead>Created</TableHead>
    <TableHead className="text-right">Actions</TableHead>
  </TableRow>
</TableHeader>
<TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
        Loading...
      </TableCell>
    </TableRow>
  ) : blogs.length === 0 ? (
    <TableRow>
      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
        No blogs found. Create your first blog!
      </TableCell>
    </TableRow>
  ) : (
    blogs.map((blog) => (
      <TableRow key={blog.id}>
        <TableCell className="font-medium">{blog.title}</TableCell>
        <TableCell>
          <span className="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
            {blog.category ?? "Uncategorized"}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(blog.created_at).toLocaleDateString()}
        </TableCell>
        <TableCell className="space-x-1 text-right">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/blogs/${blog.id}`)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/blogs/${blog.id}/edit`)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(blog.id)}
            className="hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogList;
