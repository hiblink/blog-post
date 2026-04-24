import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Heart, Layers, Plus } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ blogs: 0, likes: 0 });

useEffect(() => {
  if (!user) return;

  const fetchStats = async () => {
    const [blogsRes] = await Promise.all([
      supabase.from("blogs").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      blogs: blogsRes.count ?? 0,
      likes: 0,
    });
  };

  void fetchStats();
  }, [user]);

  const statCards = [
    { title: "Total Blogs", value: stats.blogs, icon: FileText, iconClassName: "text-primary" },
    { title: "Total Likes", value: stats.likes, icon: Heart, iconClassName: "text-destructive" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome back! Here&apos;s your blog overview.</p>
          </div>
          <Button onClick={() => navigate("/blogs/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Blog
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {statCards.map((stat) => (
            <Card key={stat.title} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.iconClassName}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
