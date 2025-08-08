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
  ShoppingCart,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AdminComments } from '@/components/admin-comments';
import { Navbar } from '@/components/navbar'; // Import Navbar

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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  post_id: string;
  posts?: {
    title: string;
  };
  profiles?: {
    display_name: string | null;
  };
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      // Redirect only after loading is complete and user is not an admin
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
    setSelectedFile(null);
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

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'خطا در آپلود تصویر',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
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
      let imageUrl = formData.image_url;
      
      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          return; // Stop if image upload failed
        }
      }

      const postData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        published: formData.published,
        featured: formData.featured,
        image_url: imageUrl.trim() || null,
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

  // Render content only if user is an admin after loading is complete
  if (user && isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Navbar />
        <div className="container mx-auto px-6 pt-24 pb-12">
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-solar">
                <Settings className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-solar bg-clip-text text-transparent">
                  پنل مدیریت
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  مدیریت محتوا و تنظیمات وبسایت خورشید زرین کیان
                </p>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <Card className="border-0 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">مطالب</p>
                      <p className="text-2xl font-bold text-primary">{posts.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">کامنت‌ها</p>
                      <p className="text-2xl font-bold text-secondary">{comments.length}</p>
                    </div>
                    <Plus className="w-8 h-8 text-secondary/60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-energy/10 to-energy/5 hover:from-energy/20 hover:to-energy/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">کاربران</p>
                      <p className="text-2xl font-bold text-energy">0</p>
                    </div>
                    <Users className="w-8 h-8 text-energy/60" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">سفارشات</p>
                      <p className="text-2xl font-bold text-accent">0</p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-accent/60" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="posts" className="space-y-8">
            <div className="flex items-center justify-center">
              <TabsList className="grid grid-cols-5 w-fit bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg p-1 rounded-xl">
                <TabsTrigger value="posts" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
                  <FileText className="w-4 h-4" />
                  مطالب
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground transition-all duration-300">
                  <Plus className="w-4 h-4" />
                  کامنت‌ها
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-energy data-[state=active]:text-energy-foreground transition-all duration-300">
                  <Users className="w-4 h-4" />
                  کاربران
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground transition-all duration-300">
                  <ShoppingCart className="w-4 h-4" />
                  سفارشات
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2 px-6 py-3 data-[state=active]:bg-muted data-[state=active]:text-muted-foreground transition-all duration-300">
                  <Settings className="w-4 h-4" />
                  تنظیمات
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="posts" className="space-y-8">
              <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent p-8 rounded-t-lg">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-primary flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      مدیریت مطالب
                    </CardTitle>
                    <CardDescription className="text-base">
                      ایجاد، ویرایش و حذف مطالب وبسایت
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleCreatePost} 
                    className="bg-gradient-solar hover:shadow-energy transition-all duration-300 px-6 py-3 text-lg"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 ml-2" />
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
                              <div className="min-h-[4rem] flex flex-col justify-center">
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

            <TabsContent value="comments">
              <AdminComments />
            </TabsContent>

            <TabsContent value="users" className="space-y-8">
              <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-energy/5 to-transparent p-8 rounded-t-lg">
                  <CardTitle className="text-2xl text-energy flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    مدیریت کاربران
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    مشاهده و مدیریت کاربران سیستم
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center p-12 bg-gradient-to-r from-muted/20 to-transparent rounded-lg border border-border/50">
                    <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">بخش مدیریت کاربران</p>
                    <p className="text-sm text-muted-foreground">این بخش در نسخه بعدی پیاده‌سازی خواهد شد</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-8">
              <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-accent/5 to-transparent p-8 rounded-t-lg">
                  <CardTitle className="text-2xl text-accent flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    مدیریت سفارشات
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    مشاهده و مدیریت سفارشات انرژی خورشیدی
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="text-center p-12 bg-gradient-to-r from-muted/20 to-transparent rounded-lg border border-border/50">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-2">بخش مدیریت سفارشات</p>
                    <p className="text-sm text-muted-foreground">این بخش در نسخه بعدی پیاده‌سازی خواهد شد</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-8">
              <Card className="border-0 bg-card/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="bg-gradient-to-r from-muted/10 to-transparent p-8 rounded-t-lg">
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <Settings className="w-6 h-6" />
                    تنظیمات سیستم
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    تنظیمات عمومی وبسایت و سیستم
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-border/50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        تنظیمات عمومی
                      </h3>
                      <div className="space-y-3 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>تنظیمات SEO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>مدیریت متا تگ‌ها</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>تنظیمات اجتماعی</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-lg bg-gradient-to-r from-secondary/10 to-transparent border border-border/50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        ظاهر وبسایت
                      </h3>
                      <div className="space-y-3 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span>مدیریت رنگ‌ها</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span>تنظیمات فونت</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-secondary"></div>
                          <span>لوگو و تصاویر</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 rounded-lg bg-gradient-to-r from-energy/10 to-transparent border border-border/50">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        تنظیمات محتوا
                      </h3>
                      <div className="space-y-3 text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-energy"></div>
                          <span>مدیریت دسته‌بندی‌ها</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-energy"></div>
                          <span>تنظیمات کامنت</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-energy"></div>
                          <span>مدیریت فایل</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-muted/20 to-transparent border border-border/30">
                    <p className="text-center text-muted-foreground">
                      این تنظیمات در نسخه‌های آینده پیاده‌سازی خواهند شد.
                    </p>
                  </div>
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
                  <Label htmlFor="image_url">تصویر مطلب</Label>
                  <div className="space-y-3">
                    <Input
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="لینک تصویر (اختیاری)"
                    />
                    
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">یا</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          disabled={uploadingImage}
                          asChild
                        >
                          <span className="flex items-center gap-2">
                            {uploadingImage ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            {selectedFile ? selectedFile.name : 'انتخاب تصویر'}
                          </span>
                        </Button>
                      </label>
                    </div>
                    
                    {(formData.image_url || selectedFile) && (
                      <div className="border rounded-lg p-2">
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          پیش‌نمایش تصویر:
                        </p>
                        {selectedFile ? (
                          <img 
                            src={URL.createObjectURL(selectedFile)} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : formData.image_url && (
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
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

  // Fallback for unauthorized access after loading is complete
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-energy px-4">
      <Navbar />
      <div className="text-center pt-16">
        <p className="text-muted-foreground mb-4">شما دسترسی به این صفحه ندارید. در حال هدایت به صفحه ورود...</p>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </div>
  );
}