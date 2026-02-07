"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, Instagram, Plus, RefreshCw, Send, Calendar, TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from "lucide-react";
import { toast } from "sonner";

interface SocialAccount {
  id: string;
  platform: string;
  pageName: string;
  isActive: boolean;
  lastSync: string;
  _count: {
    posts: number;
  };
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  status: string;
  publishedAt?: string;
  scheduledFor?: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  account: SocialAccount;
  product?: {
    id: string;
    name: string;
    nameAr: string;
    price: number;
    images: string[];
  };
}

export default function SocialMediaPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("accounts");

  // Connect Form
  const [platform, setPlatform] = useState("FACEBOOK");
  const [accessToken, setAccessToken] = useState("");

  // Post Form
  const [selectedAccount, setSelectedAccount] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");

  useEffect(() => {
    fetchAccounts();
    fetchPosts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/social-media/connect");
      const data = await res.json();
      if (res.ok) {
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/social-media/post");
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleConnectAccount = async () => {
    if (!platform || !accessToken) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/social-media/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, accessToken })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "تم ربط الحساب بنجاح");
        setAccessToken("");
        await fetchAccounts();
      } else {
        toast.error(data.error || "فشل ربط الحساب");
      }
    } catch (error) {
      toast.error("حدث خطأ في ربط الحساب");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishPost = async () => {
    if (!selectedAccount || !postContent) {
      toast.error("يرجى اختيار الحساب وكتابة المحتوى");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/social-media/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: selectedAccount,
          content: postContent,
          imageUrl: postImageUrl || undefined,
          scheduledFor: scheduleDate || undefined
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success(data.message || "تم نشر المنشور بنجاح");
        setPostContent("");
        setPostImageUrl("");
        setScheduleDate("");
        await fetchPosts();
      } else {
        toast.error(data.error || "فشل نشر المنشور");
      }
    } catch (error) {
      toast.error("حدث خطأ في نشر المنشور");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMetrics = async (postId: string) => {
    try {
      const res = await fetch("/api/social-media/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("تم تحديث الإحصائيات");
        await fetchPosts();
      } else {
        toast.error(data.error || "فشل تحديث الإحصائيات");
      }
    } catch (error) {
      toast.error("حدث خطأ في تحديث الإحصائيات");
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟")) return;

    try {
      const res = await fetch(`/api/social-media/connect?id=${accountId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      
      if (res.ok) {
        toast.success("تم حذف الحساب");
        await fetchAccounts();
      } else {
        toast.error(data.error || "فشل حذف الحساب");
      }
    } catch (error) {
      toast.error("حدث خطأ في حذف الحساب");
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === "FACEBOOK" ? <Facebook className="h-5 w-5" /> : <Instagram className="h-5 w-5" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PUBLISHED: "default",
      SCHEDULED: "secondary",
      DRAFT: "outline",
      FAILED: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">إدارة السوشيال ميديا</h1>
        <p className="text-muted-foreground">ربط ونشر المحتوى على Facebook و Instagram</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">
            <Users className="h-4 w-4 ml-2" />
            الحسابات ({accounts.length})
          </TabsTrigger>
          <TabsTrigger value="publish">
            <Send className="h-4 w-4 ml-2" />
            نشر منشور
          </TabsTrigger>
          <TabsTrigger value="posts">
            <TrendingUp className="h-4 w-4 ml-2" />
            المنشورات ({posts.length})
          </TabsTrigger>
        </TabsList>

        {/* ========== تبويب الحسابات ========== */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ربط حساب جديد</CardTitle>
              <CardDescription>
                اربط صفحة Facebook أو Instagram Business لتبدأ النشر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>المنصة</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FACEBOOK">Facebook</SelectItem>
                    <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Access Token</Label>
                <Textarea
                  placeholder="الصق هنا الـ Access Token من Facebook Developer Console"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  📘 <a href="https://developers.facebook.com/tools/explorer" target="_blank" className="underline">
                    احصل على Token من هنا
                  </a>
                </p>
              </div>

              <Button onClick={handleConnectAccount} disabled={loading} className="w-full">
                <Plus className="h-4 w-4 ml-2" />
                {loading ? "جاري الربط..." : "ربط الحساب"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(account.platform)}
                      <CardTitle className="text-lg">{account.pageName}</CardTitle>
                    </div>
                    <Badge variant={account.isActive ? "default" : "secondary"}>
                      {account.isActive ? "نشط" : "غير نشط"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عدد المنشورات:</span>
                      <span className="font-medium">{account._count.posts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">آخر تحديث:</span>
                      <span className="font-medium">
                        {new Date(account.lastSync).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    حذف الحساب
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لم يتم ربط أي حسابات بعد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ========== تبويب نشر المحتوى ========== */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>نشر منشور جديد</CardTitle>
              <CardDescription>انشر محتوى مباشرة أو جدوله لوقت لاحق</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>اختر الحساب</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحساب..." />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {getPlatformIcon(account.platform)} {account.pageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>المحتوى</Label>
                <Textarea
                  placeholder="اكتب محتوى المنشور..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label>رابط الصورة (اختياري)</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>جدولة المنشور (اختياري)</Label>
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handlePublishPost} disabled={loading} className="flex-1">
                  <Send className="h-4 w-4 ml-2" />
                  {scheduleDate ? "جدولة المنشور" : "نشر الآن"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== تبويب المنشورات ========== */}
        <TabsContent value="posts" className="space-y-6">
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.account.platform)}
                      <CardTitle className="text-lg">{post.account.pageName}</CardTitle>
                    </div>
                    {getStatusBadge(post.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>

                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="rounded-lg max-h-64 object-cover"
                    />
                  )}

                  {post.status === "PUBLISHED" && (
                    <div className="grid grid-cols-4 gap-4 py-4 border-t">
                      <div className="text-center">
                        <Heart className="h-5 w-5 mx-auto text-red-500 mb-1" />
                        <p className="text-2xl font-bold">{post.likes}</p>
                        <p className="text-xs text-muted-foreground">إعجابات</p>
                      </div>
                      <div className="text-center">
                        <MessageCircle className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                        <p className="text-2xl font-bold">{post.comments}</p>
                        <p className="text-xs text-muted-foreground">تعليقات</p>
                      </div>
                      <div className="text-center">
                        <Share2 className="h-5 w-5 mx-auto text-green-500 mb-1" />
                        <p className="text-2xl font-bold">{post.shares}</p>
                        <p className="text-xs text-muted-foreground">مشاركات</p>
                      </div>
                      <div className="text-center">
                        <Eye className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                        <p className="text-2xl font-bold">{post.reach}</p>
                        <p className="text-xs text-muted-foreground">وصول</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {post.status === "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshMetrics(post.id)}
                      >
                        <RefreshCw className="h-4 w-4 ml-2" />
                        تحديث الإحصائيات
                      </Button>
                    )}
                    {post.scheduledFor && (
                      <Badge variant="secondary">
                        <Calendar className="h-3 w-3 ml-1" />
                        {new Date(post.scheduledFor).toLocaleString("ar-EG")}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {posts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لم يتم نشر أي منشورات بعد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
