import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
  };
}

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!fk_comments_user_profiles(display_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;

      setNewComment('');
      fetchComments();
      toast({
        title: 'کامنت شما ثبت شد',
        description: 'نظر شما با موفقیت اضافه شد'
      });
    } catch (error) {
      toast({
        title: 'خطا در ثبت کامنت',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
      fetchComments();
      toast({
        title: 'کامنت ویرایش شد',
        description: 'تغییرات با موفقیت ذخیره شد'
      });
    } catch (error) {
      toast({
        title: 'خطا در ویرایش کامنت',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
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
        description: 'نظر با موفقیت حذف شد'
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
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <MessageCircle className="w-5 h-5" />
            دیدگاه‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <MessageCircle className="w-5 h-5" />
          دیدگاه‌ها ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="نظر خود را بنویسید..."
              className="min-h-[100px] text-right"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-gradient-solar"
              >
                {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center p-6 border border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground mb-4">
              برای ثبت نظر باید وارد حساب کاربری خود شوید
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/auth'}>
              ورود / ثبت نام
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              هنوز نظری ثبت نشده است. اولین نفر باشید!
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-border rounded-lg bg-background/50 space-y-3"
              >
                <div className="flex items-center justify-between">
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
                  
                  {user?.id === comment.user_id && (
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>ویرایش نظر</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[100px] text-right"
                              required
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleEditComment(comment.id)}
                                className="bg-gradient-solar"
                              >
                                ذخیره تغییرات
                              </Button>
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
                  )}
                </div>
                
                <p className="text-foreground leading-relaxed text-right whitespace-pre-line">
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