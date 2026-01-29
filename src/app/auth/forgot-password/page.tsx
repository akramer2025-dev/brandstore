"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // محاكاة إرسال البريد الإلكتروني
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast.success("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني");
    } catch (error) {
      toast.error("حدث خطأ. الرجاء المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
              <CardDescription>
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  "إرسال رابط إعادة التعيين"
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                تذكرت كلمة المرور؟{" "}
                <Link href="/auth/login" className="text-teal-600 hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">تحقق من بريدك الإلكتروني</h3>
                <p className="text-gray-600 text-sm">
                  لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى <strong>{email}</strong>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSubmitted(false)}
                className="mt-4"
              >
                إرسال مرة أخرى
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
