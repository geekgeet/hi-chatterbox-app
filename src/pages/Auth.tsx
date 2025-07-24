import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setError('ایمیل یا رمز عبور اشتباه است');
      } else {
        toast({
          title: 'ورود موفقیت‌آمیز',
          description: 'خوش آمدید!'
        });
      }
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('رمز عبور و تأیید آن یکسان نیستند');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, formData.displayName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setError('این ایمیل قبلاً ثبت شده است');
        } else {
          setError('خطا در ثبت نام. لطفاً دوباره تلاش کنید');
        }
      } else {
        toast({
          title: 'ثبت نام موفقیت‌آمیز',
          description: 'حساب کاربری شما ایجاد شد'
        });
        setActiveTab('signin');
      }
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('لطفاً ایمیل خود را وارد کنید');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await resetPassword(formData.email);
      
      if (error) {
        setError('خطا در ارسال ایمیل بازیابی');
      } else {
        toast({
          title: 'ایمیل بازیابی ارسال شد',
          description: 'لینک بازیابی رمز عبور به ایمیل شما ارسال شد'
        });
      }
    } catch (err) {
      setError('خطایی رخ داد. لطفاً دوباره تلاش کنید');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-energy">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-energy px-4">
      <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-primary/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-solar bg-clip-text text-transparent">
            خورشید زرین کیان
          </CardTitle>
          <CardDescription>
            ورود به پنل کاربری
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">ورود</TabsTrigger>
              <TabsTrigger value="signup">ثبت نام</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    dir="ltr"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-solar"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ورود...
                    </>
                  ) : (
                    'ورود'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  فراموشی رمز عبور
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">نام نمایشی</Label>
                  <Input
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="نام و نام خانوادگی"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">ایمیل</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    dir="ltr"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">رمز عبور</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    dir="ltr"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-solar"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      در حال ثبت نام...
                    </>
                  ) : (
                    'ثبت نام'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}