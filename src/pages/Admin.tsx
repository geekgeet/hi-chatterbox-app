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
  Loader2,
  MessageSquare,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  User,
  Mail,
  Phone,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Navbar } from '@/components/navbar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

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

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    role: string;
  }[];
}

interface Purchase {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  expiry_date: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
  };
  electricity_packages?: {
    name: string;
  };
}

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  description: string;
  ref_id: string | null;
  created_at: string;
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [postsLoading, setPostsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [purchasesLoading, setPurchasesLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    content: '',
    published: false,
    featured: false,
    image_url: ''
  });

  const [commentFormData, setCommentFormData] = useState({
    content: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const form = useForm();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAllData();
    }
  }, [user, isAdmin]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPosts(),
      fetchComments(),
      fetchUsers(),
      fetchPurchases(),
      fetchPayments()
    ]);
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری مطالب',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          posts(title),
          profiles(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری کامنت‌ها',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری کاربران',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          profiles(display_name),
          electricity_packages(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری سفارشات',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPurchasesLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profiles(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      toast({
        title: 'خطا در بارگذاری تراکنش‌ها',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setPaymentsLoading(false);
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

      toast({
        title: 'کامنت حذف شد',
        description: 'کامنت با موفقیت حذف شد'
      });

      fetchComments();
    } catch (error: any) {
      toast({
        title: 'خطا در حذف کامنت',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm('آیا از حذف این سفارش اطمینان دارید؟')) return;

    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: 'سفارش حذف شد',
        description: 'سفارش با موفقیت حذف شد'
      });

      fetchPurchases();
    } catch (error: any) {
      toast({
        title: 'خطا در حذف سفارش',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('آیا از حذف این مطلب اطمینان دارید؟')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: 'مطلب حذف شد',
        description: 'مطلب با موفقیت حذف شد'
      });

      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'خطا در حذف مطلب',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSavePost = async () => {
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('posts')
          .update(postFormData)
          .eq('id', editingPost.id);

        if (error) throw error;

        toast({
          title: 'مطلب بروزرسانی شد',
          description: 'تغییرات با موفقیت ذخیره شد'
        });
      } else {
        const { error } = await supabase
          .from('posts')
          .insert([{...postFormData, author_id: user?.id}]);

        if (error) throw error;

        toast({
          title: 'مطلب جدید ایجاد شد',
          description: 'مطلب با موفقیت اضافه شد'
        });
      }

      setShowPostDialog(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error: any) {
      toast({
        title: 'خطا در ذخیره مطلب',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setPostFormData(prev => ({ ...prev, image_url: data.publicUrl }));

      toast({
        title: 'تصویر آپلود شد',
        description: 'تصویر با موفقیت بارگذاری شد'
      });
    } catch (error: any) {
      toast({
        title: 'خطا در آپلود تصویر',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/10">
        <div className="text-center space-y-4">
          <div className="animate-solar-glow">
            <Settings className="w-16 h-16 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground text-lg">در حال بارگذاری پنل مدیریت...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const totalRevenue = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  const pendingPurchases = purchases.filter(p => p.status === 'pending').length;
  const completedPurchases = purchases.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary/10">
      <Navbar />
      
      {/* Main Container */}
      <div className="container mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-solar shadow-lg animate-energy-pulse">
              <Settings className="w-10 h-10 text-black" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-solar bg-clip-text text-transparent">
                پنل مدیریت
              </h1>
              <p className="text-muted-foreground text-xl mt-2">
                خورشید زرین کیان - سیستم مدیریت جامع
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center">
            <TabsList className="grid grid-cols-5 w-fit bg-card/80 backdrop-blur-lg border border-border/50 shadow-2xl p-2 rounded-2xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary-glow data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <TrendingUp className="w-5 h-5" />
                داشبورد
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <FileText className="w-5 h-5" />
                مطالب
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-energy data-[state=active]:to-energy data-[state=active]:text-white data-[state=active]:shadow-electric transition-all duration-300 rounded-xl">
                <MessageSquare className="w-5 h-5" />
                کامنت‌ها
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-accent data-[state=active]:to-accent data-[state=active]:text-black data-[state=active]:shadow-energy transition-all duration-300 rounded-xl">
                <Users className="w-5 h-5" />
                کاربران
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-3 px-6 py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-muted data-[state=active]:to-muted data-[state=active]:text-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-xl">
                <ShoppingCart className="w-5 h-5" />
                سفارشات
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm shadow-xl hover:shadow-energy transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">مطالب</p>
                      <p className="text-3xl font-bold text-primary">{posts.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {posts.filter(p => p.published).length} منتشر شده
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent backdrop-blur-sm shadow-xl hover:shadow-energy transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">کامنت‌ها</p>
                      <p className="text-3xl font-bold text-secondary">{comments.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        کل نظرات
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                      <MessageSquare className="w-8 h-8 text-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-energy/20 via-energy/10 to-transparent backdrop-blur-sm shadow-xl hover:shadow-electric transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">کاربران</p>
                      <p className="text-3xl font-bold text-energy">{users.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        عضو فعال
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-energy/20 group-hover:bg-energy/30 transition-colors">
                      <Users className="w-8 h-8 text-energy" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent backdrop-blur-sm shadow-xl hover:shadow-energy transition-all duration-500 group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">سفارشات</p>
                      <p className="text-3xl font-bold text-accent">{purchases.length}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {completedPurchases} تکمیل شده
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                      <ShoppingCart className="w-8 h-8 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Card */}
            <Card className="border-0 bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-lg shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-primary" />
                  آمار فروش
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">کل درآمد</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-transparent border border-secondary/20">
                    <p className="text-sm text-muted-foreground mb-2">در انتظار پرداخت</p>
                    <p className="text-2xl font-bold text-secondary">{pendingPurchases}</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-gradient-to-br from-energy/10 to-transparent border border-energy/20">
                    <p className="text-sm text-muted-foreground mb-2">پرداخت شده</p>
                    <p className="text-2xl font-bold text-energy">{completedPurchases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-secondary flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      مدیریت مطالب
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      ایجاد، ویرایش و مدیریت مطالب وبسایت
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => {
                      setPostFormData({
                        title: '',
                        description: '',
                        content: '',
                        published: false,
                        featured: false,
                        image_url: ''
                      });
                      setEditingPost(null);
                      setShowPostDialog(true);
                    }}
                    className="bg-gradient-solar hover:shadow-energy transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    مطلب جدید
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {postsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری مطالب...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز مطلبی ایجاد نشده است</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-right font-semibold">عنوان</TableHead>
                          <TableHead className="text-right font-semibold">وضعیت</TableHead>
                          <TableHead className="text-right font-semibold">تاریخ</TableHead>
                          <TableHead className="text-right font-semibold">عملیات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id} className="border-border/30 hover:bg-accent/5 transition-colors">
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {post.published && (
                                  <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                                    منتشر شده
                                  </Badge>
                                )}
                                {post.featured && (
                                  <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                                    ویژه
                                  </Badge>
                                )}
                                {!post.published && (
                                  <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                                    پیش‌نویس
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(post.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPostFormData({
                                      title: post.title,
                                      description: post.description,
                                      content: post.content,
                                      published: post.published,
                                      featured: post.featured,
                                      image_url: post.image_url || ''
                                    });
                                    setEditingPost(post);
                                    setShowPostDialog(true);
                                  }}
                                  className="border-primary/20 text-primary hover:bg-primary/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="border-energy/20 text-energy hover:bg-energy/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-energy/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl text-energy flex items-center gap-3">
                  <MessageSquare className="w-6 h-6" />
                  مدیریت کامنت‌ها
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مشاهده و مدیریت نظرات کاربران
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {commentsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-energy mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری کامنت‌ها...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز کامنتی ثبت نشده است</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="p-6 rounded-xl bg-gradient-to-r from-card to-card/50 border border-border/30 hover:border-energy/30 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-solar flex items-center justify-center">
                              <User className="w-5 h-5 text-black" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {comment.profiles?.display_name || 'کاربر ناشناس'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {comment.posts?.title}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="border-energy/20 text-energy hover:bg-energy/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-foreground leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-accent/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl text-accent flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  مدیریت کاربران
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مشاهده و مدیریت اطلاعات کاربران
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {usersLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-accent mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری کاربران...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز کاربری ثبت نام نکرده است</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((userProfile) => (
                      <Card key={userProfile.id} className="border-0 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-solar flex items-center justify-center">
                              <User className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {userProfile.display_name || 'کاربر ناشناس'}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {userProfile.user_roles?.[0]?.role === 'admin' ? 'مدیر' : 'کاربر'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">شناسه:</span>
                              <span className="font-mono text-xs">{userProfile.user_id.slice(0, 8)}...</span>
                            </div>
                            
                            {userProfile.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">تلفن:</span>
                                <span>{userProfile.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">عضویت:</span>
                              <span>{formatDate(userProfile.created_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-8">
            <Card className="border-0 bg-card/80 backdrop-blur-lg shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-muted/10 to-transparent border-b border-border/50">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6" />
                  مدیریت سفارشات
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  مشاهده و مدیریت سفارشات و خریدهای کاربران
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {purchasesLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال بارگذاری سفارشات...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">هنوز سفارشی ثبت نشده است</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="text-right font-semibold">کاربر</TableHead>
                          <TableHead className="text-right font-semibold">پکیج</TableHead>
                          <TableHead className="text-right font-semibold">مبلغ</TableHead>
                          <TableHead className="text-right font-semibold">وضعیت</TableHead>
                          <TableHead className="text-right font-semibold">تاریخ</TableHead>
                          <TableHead className="text-right font-semibold">عملیات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchases.map((purchase) => (
                          <TableRow key={purchase.id} className="border-border/30 hover:bg-accent/5 transition-colors">
                            <TableCell className="font-medium">
                              {purchase.profiles?.display_name || 'کاربر ناشناس'}
                            </TableCell>
                            <TableCell>
                              {purchase.electricity_packages?.name || 'پکیج نامشخص'}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              {formatCurrency(purchase.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={purchase.status === 'completed' ? 'default' : 
                                        purchase.status === 'pending' ? 'secondary' : 'outline'}
                                className={
                                  purchase.status === 'completed' ? 'bg-energy/10 text-energy border-energy/20' :
                                  purchase.status === 'pending' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                  'border-muted-foreground/30 text-muted-foreground'
                                }
                              >
                                {purchase.status === 'completed' ? 'تکمیل شده' :
                                 purchase.status === 'pending' ? 'در انتظار' : purchase.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(purchase.created_at)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePurchase(purchase.id)}
                                className="border-energy/20 text-energy hover:bg-energy/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Dialog */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingPost ? 'ویرایش مطلب' : 'مطلب جدید'}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? 'تغییرات مورد نظر را اعمال کنید' : 'مطلب جدید خود را ایجاد کنید'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان</Label>
                <Input
                  id="title"
                  value={postFormData.title}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="عنوان مطلب را وارد کنید"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">توضیح کوتاه</Label>
                <Input
                  id="description"
                  value={postFormData.description}
                  onChange={(e) => setPostFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="توضیح کوتاه مطلب"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">محتوا</Label>
              <Textarea
                id="content"
                value={postFormData.content}
                onChange={(e) => setPostFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="محتوای کامل مطلب را وارد کنید"
                rows={8}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">تصویر مطلب</Label>
                <div className="flex gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        handleImageUpload(file);
                      }
                    }}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">در حال آپلود...</span>
                    </div>
                  )}
                </div>
                {postFormData.image_url && (
                  <div className="mt-2">
                    <img 
                      src={postFormData.image_url} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={postFormData.published}
                    onCheckedChange={(checked) => setPostFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Label htmlFor="published">منتشر شود</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={postFormData.featured}
                    onCheckedChange={(checked) => setPostFormData(prev => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured">مطلب ویژه</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowPostDialog(false)}
              >
                <X className="w-4 h-4 ml-2" />
                انصراف
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
