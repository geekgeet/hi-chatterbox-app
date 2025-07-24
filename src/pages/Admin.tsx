import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye,
  Settings,
  FileText,
  Users,
  ShoppingCart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  title: string;
  description: string;
  content: string;
  published: boolean;
  featured: boolean;
  image_url: string | null;
  created_at: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    published: false,
    featured: false,
    image_url: ''
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchPosts();
    }
  }, [user, isAdmin]);

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'خطا در بارگذاری مطالب',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      toast({
        title: 'خطا در بارگذاری مطالب',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      published: false,
      featured: false,
      image_url: ''
    });
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    resetForm();
    setShowPostDialog(true);
  };

  const handleEditPost = (post: Post) => {
    setFormData({
      title: post.title,
      description: post.description,
      content: post.content,
      published: post.published,
      featured: post.featured,
      image_url: post.image_url || ''
    });
    setEditingPost(post);
    setShowPostDialog(true);
  };

  const handleSavePost = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'خطا در ذخیره',
        description: 'عنوان و محتوا الزامی هستند',
        variant: 'destructive'
      });
      return;
    }

    try {
      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        published: formData.published,
        featured: formData.featured,
        image_url: formData.image_url.trim() || null,
        author_id: user?.id
      };

      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) {
          toast({
            title: 'خطا در ویرایش مطلب',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'مطلب ویرایش شد',
          description: 'تغییرات با موفقیت ذخیره شد'
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([postData]);

        if (error) {
          toast({
            title: 'خطا در ایجاد مطلب',
            description: error.message,
            variant: 'destructive'
          });
          return;
        }

        toast({
          title: 'مطلب جدید ایجاد شد',
          description: 'مطلب با موفقیت اضافه شد'
        });
      }

      setShowPostDialog(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      toast({
        title: 'خطای سیستم',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('آیا از حذف این مطلب اطمینان دارید؟')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        toast({
          title: 'خطا در حذف مطلب',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'مطلب حذف شد',
        description: 'مطلب با موفقیت حذف شد'
      });

      fetchPosts();
    } catch (error) {
      toast({
        title: 'خطای سیستم',
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-energy">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-energy">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-solar bg-clip-text text-transparent mb-2">
            پنل مدیریت
          </h1>
          <p className="text-muted-foreground">
            مدیریت محتوا و تنظیمات وبسایت خورشید زرین کیان
          </p>
        </div>

        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              مطالب
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              کاربران
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              سفارشات
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              تنظیمات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>مدیریت مطالب</CardTitle>
                  <CardDescription>
                    ایجاد، ویرایش و حذف مطالب وبسایت
                  </CardDescription>
                </div>
                <Button onClick={handleCreatePost} className="bg-gradient-solar">
                  <Plus className="w-4 h-4 ml-2" />
                  مطلب جدید
                </Button>
              </CardHeader>
              
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">هنوز مطلبی ایجاد نشده است</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">عنوان</TableHead>
                        <TableHead className="text-right">وضعیت</TableHead>
                        <TableHead className="text-right">تاریخ ایجاد</TableHead>
                        <TableHead className="text-right">عملیات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{post.title}</div>
                              {post.featured && (
                                <Badge variant="default" className="mt-1 bg-gradient-solar text-black text-xs">
                                  ویژه
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? 'منتشر شده' : 'پیش‌نویس'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(post.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {post.published && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/posts/${post.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت کاربران</CardTitle>
                <CardDescription>مشاهده و مدیریت کاربران سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    این بخش در نسخه بعدی پیاده‌سازی خواهد شد
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت سفارشات</CardTitle>
                <CardDescription>مشاهده و مدیریت سفارشات برق</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    این بخش در نسخه بعدی پیاده‌سازی خواهد شد
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>تنظیمات سیستم</CardTitle>
                <CardDescription>تنظیمات عمومی وبسایت</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    این بخش در نسخه بعدی پیاده‌سازی خواهد شد
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'ویرایش مطلب' : 'ایجاد مطلب جدید'}
            </DialogTitle>
            <DialogDescription>
              اطلاعات مطلب را وارد کنید
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="عنوان مطلب"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">لینک تصویر</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">خلاصه</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="خلاصه‌ای از محتوای مطلب"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">محتوا *</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="محتوای کامل مطلب"
                rows={10}
                className="min-h-[200px]"
              />
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleSwitchChange('published', checked)}
                />
                <Label htmlFor="published">انتشار</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                />
                <Label htmlFor="featured">مطلب ویژه</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setShowPostDialog(false)}
              >
                <X className="w-4 h-4 ml-2" />
                لغو
              </Button>
              <Button
                onClick={handleSavePost}
                className="bg-gradient-solar"
              >
                <Save className="w-4 h-4 ml-2" />
                ذخیره
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}