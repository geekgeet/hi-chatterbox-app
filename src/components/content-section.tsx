import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
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
  author_id: string;
}

export function ContentSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(5);

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

  // For showing 3 posts at a time, calculate how many slides we need
  const maxSlides = Math.max(1, posts.length - 2);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };
  return (
    <section className="py-16 bg-gradient-energy">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold py-4 mb-4 bg-gradient-solar bg-clip-text text-transparent">
            اخبار و مطالب
          </h2>
          <p className="text-xl text-muted-foreground">
            آخرین اخبار و پیشرفت‌های نیروگاه خورشیدی
          </p>
        </div>

        {loading ? (
          <div className="relative max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur-sm animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
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
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              هنوز مطلبی منتشر نشده است
            </p>
          </div>
        ) : (
          <div className="relative max-w-7xl mx-auto">
            {/* Navigation buttons */}
            {posts.length > 3 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary"
                  onClick={nextSlide}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-primary/30 hover:border-primary"
                  onClick={prevSlide}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Slideshow container */}
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * (100 / posts.length)}%)`,
                  width: `${posts.length * (100 / 3)}%`
                }}
              >
                {posts.map((post) => (
                  <div key={post.id} className="w-1/3 flex-shrink-0 px-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-fade-in h-full">
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
                        <CardTitle className="text-right text-foreground hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="text-right text-muted-foreground line-clamp-2">
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
                            ادمین
                          </div>
                        </div>
                        
                        <p className="text-foreground/80 text-right leading-relaxed line-clamp-2">
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
                  </div>
                ))}
              </div>
            </div>

            {/* Slide indicators */}
            {posts.length > 3 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: maxSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-primary scale-125' 
                        : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}
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