import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  featured: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string | null;
  } | null;
}

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(display_name)
        `)
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) {
        toast({
          title: 'خطا در بارگذاری مطلب',
          description: 'مطلب مورد نظر یافت نشد',
          variant: 'destructive'
        });
        navigate('/posts');
        return;
      }

      setPost(data as unknown as Post);
    } catch (error) {
      toast({
        title: 'خطا در بارگذاری مطلب',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
      navigate('/posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-energy">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-sm animate-pulse">
              <div className="h-64 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-energy">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">مطلب یافت نشد</h1>
            <Button onClick={() => navigate('/posts')}>
              بازگشت به آرشیو مطالب
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-energy">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => navigate('/posts')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="ml-2 w-4 h-4" />
            بازگشت به آرشیو مطالب
          </Button>

          <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
            {/* Featured Image */}
            {post.image_url && (
              <div className="h-64 md:h-96 overflow-hidden rounded-t-lg">
                <img 
                  src={post.image_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {post.featured && (
                  <Badge variant="default" className="bg-gradient-solar text-black">
                    مطلب ویژه
                  </Badge>
                )}
                <Badge variant="outline" className="border-primary/30">
                  اخبار نیروگاه
                </Badge>
              </div>

              {/* Title */}
              <CardTitle className="text-2xl md:text-3xl font-bold text-right text-foreground leading-relaxed">
                {post.title}
              </CardTitle>

              {/* Description */}
              <CardDescription className="text-lg text-right text-muted-foreground leading-relaxed">
                {post.description}
              </CardDescription>

              {/* Meta Information */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 ml-1" />
                    <span>{post.profiles?.display_name || 'مدیر سایت'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 ml-1" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
                
                {post.created_at !== post.updated_at && (
                  <div className="text-xs text-muted-foreground">
                    آخرین ویرایش: {formatDate(post.updated_at)}
                  </div>
                )}
              </div>
            </CardHeader>

            <Separator className="mx-6" />

            <CardContent className="pt-8">
              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-right text-foreground leading-relaxed"
                style={{ 
                  whiteSpace: 'pre-line',
                  fontFamily: 'inherit'
                }}
              >
                {post.content}
              </div>

              {/* Call to Action */}
              <div className="mt-12 pt-8 border-t border-border">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">
                    علاقه‌مند به خدمات نیروگاه خورشیدی هستید؟
                  </h3>
                  <p className="text-muted-foreground">
                    برای دریافت اطلاعات بیشتر و مشاوره رایگان با ما تماس بگیرید
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => navigate('/#contact')}
                      className="bg-gradient-solar"
                    >
                      تماس با ما
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/#calculator')}
                      className="border-primary/30 hover:border-primary"
                    >
                      محاسبه قیمت برق
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}