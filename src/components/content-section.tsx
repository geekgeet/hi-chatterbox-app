import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  featured: boolean;
  image_url: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
}

export function ContentSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(display_name)
        `)
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(data as unknown as Post[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  return (
    <section className="py-16 bg-gradient-energy">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-solar bg-clip-text text-transparent">
            اخبار و مطالب
          </h2>
          <p className="text-xl text-muted-foreground">
            آخرین اخبار و پیشرفت‌های نیروگاه خورشیدی
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card/80 backdrop-blur-sm animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              هنوز مطلبی منتشر نشده است
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts.map((post) => (
              <Card 
                key={post.id} 
                className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-energy-pulse"
              >
                {post.image_url && (
                  <div className="h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-right text-foreground hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-right text-muted-foreground line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 ml-1" />
                      {formatDate(post.created_at)}
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 ml-1" />
                      {post.profiles?.display_name || 'ادمین'}
                    </div>
                  </div>
                  
                  <p className="text-foreground/80 text-right leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                  
                  <Link to={`/posts/${post.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      مطالعه بیشتر
                      <ArrowLeft className="mr-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/posts">
            <Button 
              size="lg"
              className="bg-gradient-solar hover:scale-105 transition-all duration-300"
            >
              مشاهده همه مطالب
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}