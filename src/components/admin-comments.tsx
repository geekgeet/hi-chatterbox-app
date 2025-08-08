import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Trash2, Eye, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  profiles?: {
    display_name: string | null;
  };
  posts?: {
    title: string;
  };
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!fk_comments_user_profiles(display_name),
          posts(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'خطا در بارگذاری کامنت‌ها',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('آیا از حذف این کامنت اطمینان دارید؟')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      fetchComments();
      toast({
        title: 'کامنت حذف شد',
        description: 'کامنت با موفقیت حذف شد'
      });
    } catch (error) {
      toast({
        title: 'خطا در حذف کامنت',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            مدیریت کامنت‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          مدیریت کامنت‌ها ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              هیچ کامنتی یافت نشد
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-border rounded-lg bg-background/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="w-4 h-4 ml-1" />
                        <span>{comment.profiles?.display_name || 'کاربر'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 ml-1" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                      {comment.created_at !== comment.updated_at && (
                        <Badge variant="secondary" className="text-xs">
                          ویرایش شده
                        </Badge>
                      )}
                    </div>
                    {comment.posts?.title && (
                      <div className="text-sm text-muted-foreground">
                        مطلب: {comment.posts.title}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>مشاهده کامنت</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <strong>نویسنده:</strong> {comment.profiles?.display_name || 'کاربر'}
                          </div>
                          <div>
                            <strong>تاریخ:</strong> {formatDate(comment.created_at)}
                          </div>
                          {comment.posts?.title && (
                            <div>
                              <strong>مطلب:</strong> {comment.posts.title}
                            </div>
                          )}
                          <div>
                            <strong>متن کامنت:</strong>
                            <p className="mt-2 p-3 bg-muted rounded text-right leading-relaxed whitespace-pre-line">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-foreground leading-relaxed text-right line-clamp-2">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}